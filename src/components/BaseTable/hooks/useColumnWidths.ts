import * as React from 'react';

import type {Table} from '@tanstack/react-table';
import {flushSync} from 'react-dom';

import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';
import type {ColumnDef} from '../../../types/base';
import {measureGridColumns} from '../utils/measureGridColumns';

const autoSizeHandlers = new WeakMap<object, (id: string) => void>();

/** @internal */
export function autoSizeColumn(table: object, id: string): boolean {
    const handler = autoSizeHandlers.get(table);
    if (!handler) return false;
    handler(id);
    return true;
}

/** Native track measurement follows react-data-grid's measured/resized width lifecycle. */
export function useColumnWidths<T>(table: Table<T>) {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const [measured, setMeasured] = React.useState<Record<string, number>>({});
    const [autoResize, setAutoResize] = React.useState<string | null>(null);
    const [gridWidth, setGridWidth] = React.useState(0);
    const source = React.useRef({columns: table.options.columns, applied: table.options.columns});
    if (table.options.columns !== source.current.applied)
        source.current.columns = table.options.columns;
    const columns = source.current.columns as ColumnDef<T>[];
    const leafColumns = (defs: ColumnDef<T>[]): ColumnDef<T>[] =>
        defs.flatMap((column) =>
            'columns' in column && column.columns ? leafColumns(column.columns) : [column],
        );
    const leaves = leafColumns(columns);
    const enabled = leaves.some((column) => column.width !== undefined);
    const sizing = table.getState().columnSizing;
    const previous = React.useRef({gridWidth, sizing});
    const getId = (column: ColumnDef<T>): string =>
        column.id ??
        ('accessorKey' in column
            ? String(column.accessorKey).replace(/\./g, '_')
            : String(column.header ?? ''));
    const applied = React.useMemo(() => {
        if (!enabled) return columns;
        const apply = (defs: ColumnDef<T>[]): ColumnDef<T>[] =>
            defs.map((column) => {
                if ('columns' in column && column.columns)
                    return {...column, columns: apply(column.columns)};
                const id =
                    column.id ??
                    ('accessorKey' in column
                        ? String(column.accessorKey).replace(/\./g, '_')
                        : String(column.header ?? ''));
                const size = typeof column.width === 'number' ? column.width : measured[id];
                return size === undefined ? column : {...column, size};
            });
        return apply(columns);
    }, [columns, enabled, measured]);
    if (enabled) {
        source.current.applied = applied;
        if (table.options.columns !== applied)
            table.setOptions((current) => ({...current, columns: applied}));
    }

    useIsomorphicLayoutEffect(() => {
        if (!enabled) return undefined;
        const element = tableRef.current;
        if (!element) return undefined;
        const observer =
            typeof ResizeObserver === 'function'
                ? new ResizeObserver(([entry]) => {
                      const width =
                          (element.parentElement ?? element).clientWidth || entry.contentRect.width;
                      setGridWidth((current) =>
                          Math.abs(current - width) < 0.5 ? current : width,
                      );
                  })
                : undefined;
        // A table can overflow its viewport. Its intrinsic width must not become
        // an input to its next measurement (a resize feedback loop).
        observer?.observe(element.parentElement ?? element);
        autoSizeHandlers.set(table, (id) => flushSync(() => setAutoResize(id)));
        return () => {
            observer?.disconnect();
            autoSizeHandlers.delete(table);
        };
    }, [enabled, table]);

    useIsomorphicLayoutEffect(() => {
        if (!enabled || !tableRef.current) return;
        // The virtualizer realizes its first rows after it learns the viewport.
        // Do not permanently cache header-only widths while actual data is pending.
        if (
            table.getRowModel().rows.length &&
            !tableRef.current.tBodies[0]?.querySelector(
                '[data-column-id]:not([data-virtualization-cell-content="deferred"])',
            )
        )
            return;
        const visible = table.getVisibleLeafColumns();
        const last = previous.current;
        const resized =
            Object.keys(sizing).length !== Object.keys(last.sizing).length ||
            Object.keys(sizing).some((id) => sizing[id] !== last.sizing[id]);
        const viewportWidth = gridWidth || tableRef.current.parentElement?.clientWidth || 0;
        const widthChanged = Math.abs(viewportWidth - last.gridWidth) >= 0.5;
        const pending = new Set<string>();
        const tracks = visible.map((column) => {
            const definition = leaves.find((leaf) => getId(leaf) === column.id);
            const width =
                definition?.width ?? (definition?.size === undefined ? 'auto' : definition.size);
            if (column.id === autoResize) {
                pending.add(column.id);
                return 'max-content';
            }
            if (sizing[column.id] !== undefined) return `${column.getSize()}px`;
            if (typeof width === 'number') return `${width}px`;
            if (widthChanged || resized || measured[column.id] === undefined) {
                pending.add(column.id);
                return width;
            }
            return `${measured[column.id]}px`;
        });
        if (!pending.size) {
            previous.current = {gridWidth: viewportWidth, sizing};
            return;
        }
        const widths = measureGridColumns(tableRef.current, visible, tracks, viewportWidth);
        if (!widths) return;
        previous.current = {gridWidth: viewportWidth, sizing};
        setMeasured((current) => {
            const next = {...current};
            for (const id of pending) if (widths[id] !== undefined) next[id] = widths[id];
            return Object.keys(next).every((id) => next[id] === current[id]) ? current : next;
        });
        if (autoResize !== null) {
            const width = widths[autoResize];
            if (width !== undefined)
                table.setColumnSizing((current) => ({...current, [autoResize]: width}));
            setAutoResize(null);
        }
    });
    return {tableRef};
}
