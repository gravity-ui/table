import * as React from 'react';

import type {ColumnDef} from '@tanstack/react-table';
import debounce from 'lodash/debounce.js';
import {useDeepCompareEffect} from 'react-use';

import type {useTable} from '..';
import {useConditionallyControlledState} from '../useConditionallyControlledState';

import {cellDefaultWidth, emptyColumnSizing, emptyRows, headerDefaultWidth} from './constants';
import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';
import type {UseMeasureCellWidthProps} from './hooks/useMeasureCellWidth';
import type {CalculateColumnWidthsArgs, UseColumnsAutoSizeOptions} from './types';
import {getValueFromCell} from './utils/getValueFromCell';
import {hasDefinedWidth} from './utils/hasDefinedWidth';
import {renderHeaderContent} from './utils/renderHeaderContent';
import {setColumnAutoSizes} from './utils/setColumnAutoSizes';

export type UseColumnsAutoSizeProps<TData extends unknown> = {
    columns: ColumnDef<TData>[];
    options?: UseColumnsAutoSizeOptions;
    /** Controlled auto widths, keyed by column ID. Pass with onChangeColumnWidths. */
    columnWidths?: Record<string, number>;
    /** Called when auto widths change, in controlled or uncontrolled mode. */
    onChangeColumnWidths?: (columnWidths: Record<string, number>) => void;
} & UseMeasureCellWidthProps;

export function useColumnsAutoSize<TData extends unknown>({
    columns,
    options,
    renderElementForMeasure,
    columnWidths: controlledColumnWidths,
    onChangeColumnWidths,
}: UseColumnsAutoSizeProps<TData>) {
    const [rawColumnWidths, setColumnWidths] = useConditionallyControlledState(
        controlledColumnWidths,
        onChangeColumnWidths,
        {},
    );
    const columnWidths = React.useMemo(() => {
        const widths: Record<string, number> = {};
        for (const column of columns) {
            const id = column.id || ('accessorKey' in column && String(column.accessorKey)) || '';
            const width = rawColumnWidths[id];
            if (width !== undefined && Number.isFinite(width) && width > 0) widths[id] = width;
        }
        return widths;
    }, [columns, rawColumnWidths]);
    const hasAllWidths = columns.every((column) => {
        const id = column.id || ('accessorKey' in column && String(column.accessorKey)) || '';
        return (
            columnWidths[id] !== undefined ||
            (options?.respectExistingWidths !== false && hasDefinedWidth(column))
        );
    });
    const [isMeasuring, setIsMeasuring] = React.useState(!hasAllWidths);
    const [tableInstance, setTableInstance] = React.useState<ReturnType<
        typeof useTable<TData>
    > | null>(null);

    const measurementGenerationRef = React.useRef(0);

    const rows = tableInstance?.getRowModel().rows ?? emptyRows;

    const sampledRows = rows.slice(0, options?.sampleSize ?? 100);
    const columnSizing = tableInstance?.getState().columnSizing ?? emptyColumnSizing;

    const rowsDataKey = sampledRows.map((row) => row.id).join(',');
    const columnIds = columns.map(
        (column) => column.id || ('accessorKey' in column && String(column.accessorKey)) || '',
    );
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

    const calculateWidths = React.useMemo(
        () =>
            debounce(
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
                }: CalculateColumnWidthsArgs<TData>) => {
                    const newWidths: Record<string, number> = {};

                    const userResizedColumns = respectResizedWidths ? columnSizing : {};
                    const isStale = () =>
                        measurementGeneration !== measurementGenerationRef.current;

                    for (const column of columns) {
                        if (isStale()) {
                            return;
                        }

                        const id =
                            column.id ||
                            ('accessorKey' in column && String(column.accessorKey)) ||
                            '';

                        if (!id) continue;

                        if (respectResizedWidths && userResizedColumns[id]) {
                            newWidths[id] = userResizedColumns[id];

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
                                const headerContent = await renderHeaderContent(
                                    tableInstance,
                                    column,
                                );

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

                    setColumnWidths((currentWidths) =>
                        Object.keys(currentWidths).length === Object.keys(newWidths).length &&
                        Object.keys(newWidths).every((id) => currentWidths[id] === newWidths[id])
                            ? currentWidths
                            : newWidths,
                    );
                    setIsMeasuring(false);
                },
                100,
            ),
        [setColumnWidths],
    );

    useDeepCompareEffect(() => {
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
            columns,
            measureCellWidth,
            sampledRows,
            tableInstance,
            ...options,
            previousColumnWidths: columnWidths,
            measurementGeneration,
        });

        return cancelMeasurement;
    }, [columnSizing, rowsDataKey, columnsKey, controlledColumnWidths]);

    const columnsWithAutoSizes = React.useMemo(
        () => setColumnAutoSizes(columns, columnWidths, columnSizing),
        [columns, columnWidths, columnSizing],
    );

    return {
        columnWidths,
        setTableInstance,
        columnsWithAutoSizes,
        isMeasuring: isMeasuring && !hasAllWidths,
    };
}
