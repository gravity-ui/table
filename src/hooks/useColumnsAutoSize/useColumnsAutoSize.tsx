import * as React from 'react';

import type {ColumnDef} from '@tanstack/react-table';
import debounce from 'lodash/debounce.js';
import isEqual from 'lodash/isEqual.js';
import {useDeepCompareEffect} from 'react-use';

import type {useTable} from '..';
import {useConditionallyControlledState} from '../useConditionallyControlledState';
import {useIsomorphicLayoutEffect} from '../useIsomorphicLayoutEffect';

import {cellDefaultWidth, emptyColumnSizing, emptyRows, headerDefaultWidth} from './constants';
import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';
import type {UseMeasureCellWidthProps} from './hooks/useMeasureCellWidth';
import type {
    CalculateColumnWidthsArgs,
    DOMMeasurementOptions,
    UseColumnsAutoSizeOptions,
} from './types';
import {getColumnId, getLeafColumns} from './utils/getColumnId';
import {getValueFromCell} from './utils/getValueFromCell';
import {hasDefinedWidth} from './utils/hasDefinedWidth';
import {measureDOMColumns} from './utils/measureDOMColumns';
import {renderHeaderContent} from './utils/renderHeaderContent';
import {setColumnAutoSizes} from './utils/setColumnAutoSizes';

export type UseColumnsAutoSizeProps<TData extends unknown> = {
    columns: ColumnDef<TData>[];
    options?: UseColumnsAutoSizeOptions;
    /** Font/theme inheritance context for columns with meta.autoSize. Defaults to body. */
    measurementContainerRef?: React.RefObject<HTMLElement | null>;
    measurementClassName?: string;
    /** Invalidate measureOnce after a theme/style change. Font loading is automatic. */
    measurementRevision?: string | number | boolean | null;
    /** Controlled auto widths, keyed by column ID. Pass with onChangeColumnWidths. */
    columnWidths?: Record<string, number>;
    /** Called when auto widths change, in controlled or uncontrolled mode. */
    onChangeColumnWidths?: (columnWidths: Record<string, number>) => void;
} & UseMeasureCellWidthProps;

export function useColumnsAutoSize<TData extends unknown>({
    columns,
    options,
    renderElementForMeasure,
    measurementContainerRef,
    measurementClassName,
    measurementRevision,
    columnWidths: controlledColumnWidths,
    onChangeColumnWidths,
}: UseColumnsAutoSizeProps<TData>) {
    const leafColumns = React.useMemo(() => getLeafColumns(columns), [columns]);
    const [rawColumnWidths, setColumnWidths] = useConditionallyControlledState(
        controlledColumnWidths,
        onChangeColumnWidths,
        {},
    );
    const columnWidths = React.useMemo(() => {
        const widths: Record<string, number> = {};
        for (const column of leafColumns) {
            const id = getColumnId(column);
            const width = rawColumnWidths[id];
            if (width !== undefined && Number.isFinite(width) && width > 0) widths[id] = width;
        }
        return widths;
    }, [leafColumns, rawColumnWidths]);
    const hasAllWidths = leafColumns.every((column) => {
        const id = getColumnId(column);
        return (
            !id ||
            columnWidths[id] !== undefined ||
            (options?.respectExistingWidths !== false && hasDefinedWidth(column))
        );
    });
    const [isMeasuring, setIsMeasuring] = React.useState(!hasAllWidths);
    const [tableInstance, setTableInstance] = React.useState<ReturnType<
        typeof useTable<TData>
    > | null>(null);

    const measurementGenerationRef = React.useRef(0);
    const domEnabled = leafColumns.some((column) => column.meta?.autoSize !== undefined);
    const domMeasurement = React.useMemo<DOMMeasurementOptions | undefined>(
        () =>
            domEnabled
                ? {
                      containerRef: measurementContainerRef,
                      className: measurementClassName,
                      revision: measurementRevision,
                  }
                : undefined,
        [domEnabled, measurementContainerRef, measurementClassName, measurementRevision],
    );

    const rows = tableInstance?.getRowModel().rows ?? emptyRows;

    const sampledRows = rows.slice(0, options?.sampleSize ?? 100);
    const columnSizing = tableInstance?.getState().columnSizing ?? emptyColumnSizing;

    const rowsDataKey = sampledRows.map((row) => row.id).join(',');
    const columnIds = leafColumns.map(getColumnId);
    const columnsKey = JSON.stringify(columnIds);

    React.useEffect(() => {
        const activeColumnIds = new Set(columnIds);

        setColumnWidths((currentWidths) => {
            const nextWidths: Record<string, number> = {};
            let changed = false;

            for (const [columnId, width] of Object.entries(currentWidths)) {
                if (activeColumnIds.has(columnId) && Number.isFinite(width) && width > 0) {
                    nextWidths[columnId] = width;
                } else {
                    changed = true;
                }
            }

            return changed ? nextWidths : currentWidths;
        });
        // `columnsKey` is the stable value representation of `columnIds`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsKey]);

    const measureCellWidth = useMeasureCellWidth({
        renderElementForMeasure,
    });

    const calculateWidthsImmediately = React.useCallback(
        async ({
            columnSizing,
            columns,
            measureCellWidth,
            sampledRows,
            tableInstance,
            measurementGeneration,
            minWidth = 50,
            maxWidth = 500,
            padding = 16,
            headerPadding = 24,
            measureHeaderText = true,
            respectExistingWidths = true,
            respectResizedWidths = true,
            measureOnce = false,
            previousColumnWidths,
            partial = false,
            deferUpdates = false,
        }: CalculateColumnWidthsArgs<TData>) => {
            const newWidths: Record<string, number> = {};

            const userResizedColumns = respectResizedWidths ? columnSizing : {};
            const isStale = () => measurementGeneration !== measurementGenerationRef.current;

            for (const column of columns) {
                if (isStale()) {
                    return;
                }

                const id = getColumnId(column);

                if (!id) continue;

                if (respectResizedWidths && userResizedColumns[id]) {
                    if (!partial) newWidths[id] = userResizedColumns[id];

                    continue;
                }

                if (respectExistingWidths && hasDefinedWidth(column)) {
                    if (typeof column.size === 'number') {
                        newWidths[id] = column.size;
                    } else if (
                        typeof column.minSize === 'number' &&
                        typeof column.maxSize === 'number' &&
                        column.minSize === column.maxSize
                    ) {
                        newWidths[id] = column.minSize;
                    }

                    continue;
                }

                if (measureOnce && previousColumnWidths[id] !== undefined) {
                    newWidths[id] = previousColumnWidths[id];
                    continue;
                }

                let maxContentWidth = 0;

                if (measureHeaderText && column.header) {
                    try {
                        const headerContent = await renderHeaderContent(tableInstance, column);

                        if (isStale()) {
                            return;
                        }

                        const headerWidth = await measureCellWidth(headerContent, 'header');

                        if (isStale()) {
                            return;
                        }

                        if (headerWidth === 0) {
                            maxContentWidth = headerDefaultWidth + headerPadding;
                        } else {
                            maxContentWidth = headerWidth + headerPadding;
                        }
                    } catch {
                        maxContentWidth = headerDefaultWidth + headerPadding;
                    }
                }

                for (const row of sampledRows) {
                    if (isStale()) {
                        return;
                    }

                    try {
                        const cellValue = getValueFromCell(tableInstance, column, row);

                        if (cellValue === null || cellValue === undefined) {
                            continue;
                        }

                        const cellWidth = await measureCellWidth(cellValue, 'cell');

                        if (isStale()) {
                            return;
                        }

                        maxContentWidth = Math.max(maxContentWidth, cellWidth + padding);
                    } catch {}
                }

                if (maxContentWidth <= padding) {
                    maxContentWidth = cellDefaultWidth;
                }

                newWidths[id] = Math.min(Math.max(maxContentWidth, minWidth), maxWidth);
            }

            if (isStale()) {
                return;
            }

            const commit = () => {
                setColumnWidths((currentWidths) => {
                    const result = partial ? {...currentWidths, ...newWidths} : newWidths;
                    // Never copy a manual width into the auto-width store.
                    if (partial)
                        for (const id of Object.keys(
                            tableInstance?.getState().columnSizing ?? {},
                        )) {
                            if (currentWidths[id] === undefined) delete result[id];
                            else result[id] = currentWidths[id];
                        }
                    return isEqual(currentWidths, result) ? currentWidths : result;
                });
                setIsMeasuring(false);
            };
            if (deferUpdates && React.startTransition) {
                React.startTransition(commit);
            } else {
                commit();
            }
        },
        [setColumnWidths],
    );

    const calculateWidths = React.useMemo(
        () => debounce(calculateWidthsImmediately, 100),
        [calculateWidthsImmediately],
    );
    const [fontRevision, onFontsLoaded] = React.useReducer((revision: number) => revision + 1, 0);
    const [layoutRevision, retryLayout] = React.useReducer((revision: number) => revision + 1, 0);
    const [waitingForLayout, setWaitingForLayout] = React.useState(false);
    const headerOnly = React.useRef(new Set<string>());
    const previousSizing = React.useRef<Record<string, number>>({});
    const lastDOMInputs = React.useRef<
        | {
              rows: Array<{id: string; original: TData}>;
              columns: ColumnDef<TData>[];
              measurement: {
                  container: HTMLElement | null;
                  className?: string;
                  revision?: typeof measurementRevision;
              };
              options: typeof options;
              controlledWidths: typeof controlledColumnWidths;
              fontRevision: number;
              layoutRevision: number;
          }
        | undefined
    >(undefined);
    useIsomorphicLayoutEffect(() => {
        if (!domEnabled) return undefined;
        const fonts = (measurementContainerRef?.current?.ownerDocument ?? document).fonts;
        if (!fonts) return undefined;
        let active = true;
        let initialPending = fonts.status === 'loading';
        const loaded = () => {
            if (!active || fonts.status === 'loading') return;
            initialPending = false;
            onFontsLoaded();
        };
        // Subscribe before measuring. ready also covers a load started before mount.
        fonts.addEventListener('loadingdone', loaded);
        fonts.ready?.then(() => {
            if (initialPending) loaded();
        });
        return () => {
            active = false;
            fonts.removeEventListener('loadingdone', loaded);
        };
    }, [domEnabled, measurementContainerRef]);
    React.useEffect(() => {
        if (!waitingForLayout) return undefined;
        const container = measurementContainerRef?.current ?? document.body;
        let wasConnected = container.isConnected;
        const retry = () => {
            if (
                !container.isConnected ||
                (!container.getClientRects().length &&
                    container.ownerDocument.defaultView?.getComputedStyle(container).display !==
                        'contents')
            )
                return;
            retryLayout();
        };
        const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(retry) : undefined;
        const mutation = new MutationObserver((records) => {
            if (
                records.some(
                    (record) =>
                        record.type === 'attributes' &&
                        (record.target === container ||
                            (record.target as Element).contains(container)),
                ) ||
                (!wasConnected && container.isConnected)
            )
                retry();
            wasConnected = container.isConnected;
        });
        resize?.observe(container);
        mutation.observe(container.ownerDocument.documentElement, {
            attributes: true,
            childList: true,
            subtree: true,
        });
        return () => {
            resize?.disconnect();
            mutation.disconnect();
        };
    }, [waitingForLayout, measurementContainerRef]);

    useIsomorphicLayoutEffect(() => {
        if (!domMeasurement || !tableInstance) return;
        const currentRows = tableInstance.getRowModel().rows.slice(0, options?.sampleSize ?? 100);
        const inputs = {
            rows: currentRows.map((row) => ({id: row.id, original: row.original})),
            columns: leafColumns,
            measurement: {
                container: measurementContainerRef?.current ?? null,
                className: measurementClassName,
                revision: measurementRevision,
            },
            options,
            controlledWidths: controlledColumnWidths,
            fontRevision,
            layoutRevision,
        };
        const sizing = tableInstance.getState().columnSizing;
        const released = Object.keys(previousSizing.current).filter(
            (id) => sizing[id] === undefined,
        );
        const added = Object.keys(sizing).filter((id) => previousSizing.current[id] === undefined);
        previousSizing.current = sizing;
        const previous = lastDOMInputs.current;
        const changed = !isEqual(previous, inputs);
        if (!changed && !released.length && !added.length) return;
        lastDOMInputs.current = inputs;
        const generation = ++measurementGenerationRef.current;
        calculateWidths.cancel();
        const refresh =
            previous &&
            (previous.fontRevision !== fontRevision ||
                previous.measurement.revision !== measurementRevision);
        const force = new Set(released);
        if (currentRows.length) for (const id of headerOnly.current) force.add(id);
        const pending = leafColumns.filter((column) => {
            const id = getColumnId(column);
            if (!id || (options?.respectExistingWidths !== false && hasDefinedWidth(column)))
                return false;
            if (options?.respectResizedWidths !== false && sizing[id] !== undefined) return false;
            if (!changed && !force.has(id) && columnWidths[id] !== undefined) return false;
            return (
                !options?.measureOnce || refresh || force.has(id) || columnWidths[id] === undefined
            );
        });
        const measured = measureDOMColumns({
            columns: pending,
            rows: currentRows,
            measurement: domMeasurement,
            options: options ?? {},
        });
        if (measured === undefined) {
            setWaitingForLayout(true);
            if (!currentRows.length) setIsMeasuring(false);
            return;
        }
        setWaitingForLayout(false);
        const fallback = pending.filter((column) => measured[getColumnId(column)] === undefined);
        for (const column of fallback) {
            const id = getColumnId(column);
            if (!currentRows.length) headerOnly.current.add(id);
            else headerOnly.current.delete(id);
        }
        const widths = {...columnWidths};
        for (const column of leafColumns) {
            const id = getColumnId(column);
            if (!id) continue;
            if (options?.respectExistingWidths !== false && hasDefinedWidth(column)) {
                widths[id] = column.size ?? column.minSize!;
            }
            if (measured[id] !== undefined) {
                widths[id] = Math.min(
                    options?.maxWidth ?? 500,
                    Math.max(options?.minWidth ?? 50, measured[id]),
                );
                if (!currentRows.length) headerOnly.current.add(id);
                else headerOnly.current.delete(id);
            }
        }
        const commit = () => {
            setColumnWidths((current) => (isEqual(current, widths) ? current : widths));
            if (isMeasuring !== fallback.length > 0) setIsMeasuring(fallback.length > 0);
        };
        if (options?.deferUpdates && React.startTransition) React.startTransition(commit);
        else commit();
        if (fallback.length)
            calculateWidths({
                columns: fallback,
                columnSizing: sizing,
                sampledRows: currentRows,
                tableInstance,
                measureCellWidth,
                measurementGeneration: generation,
                ...options,
                measureOnce: false,
                previousColumnWidths: widths,
                partial: true,
            });
    });
    React.useEffect(
        () => () => {
            measurementGenerationRef.current += 1;
            calculateWidths.cancel();
            lastDOMInputs.current = undefined;
        },
        [calculateWidths],
    );

    useDeepCompareEffect(() => {
        if (domMeasurement) return undefined;
        const measurementGeneration = ++measurementGenerationRef.current;
        const cancelMeasurement = () => {
            if (measurementGenerationRef.current === measurementGeneration) {
                measurementGenerationRef.current += 1;
            }

            calculateWidths.cancel();
        };

        calculateWidths.cancel();

        if (!sampledRows.length) {
            return cancelMeasurement;
        }

        if (
            options?.measureOnce &&
            columnIds.every((columnId) => columnWidths[columnId] !== undefined)
        ) {
            return cancelMeasurement;
        }

        calculateWidths({
            columnSizing,
            columns: leafColumns,
            measureCellWidth,
            sampledRows,
            tableInstance,
            ...options,
            previousColumnWidths: columnWidths,
            measurementGeneration,
        });

        return cancelMeasurement;
    }, [columnSizing, rowsDataKey, columnsKey, controlledColumnWidths, Boolean(domMeasurement)]);

    const appliedSizing = domEnabled ? emptyColumnSizing : columnSizing;
    const columnsWithAutoSizes = React.useMemo(
        () => setColumnAutoSizes(columns, columnWidths, appliedSizing, !domEnabled),
        [columns, columnWidths, appliedSizing, domEnabled],
    );

    return {
        columnWidths,
        setTableInstance,
        columnsWithAutoSizes,
        isMeasuring: domEnabled
            ? rows.length > 0 && (!hasAllWidths || isMeasuring)
            : isMeasuring && !hasAllWidths,
    };
}
