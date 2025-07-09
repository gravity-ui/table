import * as React from 'react';

import type {ColumnDef} from '@tanstack/react-table';
import debounce from 'lodash/debounce';
import {useDeepCompareEffect} from 'react-use';

import type {useTable} from '..';

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
} & UseMeasureCellWidthProps;

export function useColumnsAutoSize<TData extends unknown>({
    columns,
    options,
    renderElementForMeasure,
}: UseColumnsAutoSizeProps<TData>) {
    const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
    const [isMeasuring, setIsMeasuring] = React.useState<boolean>(true);
    const [tableInstance, setTableInstance] = React.useState<ReturnType<
        typeof useTable<TData>
    > | null>(null);

    const rows = tableInstance?.getRowModel().rows ?? emptyRows;

    const sampledRows = rows.slice(0, options?.sampleSize ?? 100);
    const columnSizing = tableInstance?.getState().columnSizing ?? emptyColumnSizing;

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
                    minWidth = 50,
                    maxWidth = 500,
                    padding = 16,
                    headerPadding = 24,
                    measureHeaderText = true,
                    respectExistingWidths = true,
                    respectResizedWidths = true,
                }: CalculateColumnWidthsArgs<TData>) => {
                    const newWidths: Record<string, number> = {};

                    const userResizedColumns = respectResizedWidths ? columnSizing : {};

                    for (const column of columns) {
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

                        let maxContentWidth = 0;

                        if (measureHeaderText && column.header) {
                            try {
                                const headerContent = await renderHeaderContent(
                                    tableInstance,
                                    column,
                                );

                                const headerWidth = await measureCellWidth(headerContent, 'header');

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
                            try {
                                const cellValue = getValueFromCell(tableInstance, column, row);

                                if (cellValue === null || cellValue === undefined) {
                                    continue;
                                }

                                const cellWidth = await measureCellWidth(cellValue, 'cell');

                                maxContentWidth = Math.max(maxContentWidth, cellWidth + padding);
                            } catch {}
                        }

                        if (maxContentWidth <= padding) {
                            maxContentWidth = cellDefaultWidth;
                        }

                        newWidths[id] = Math.min(Math.max(maxContentWidth, minWidth), maxWidth);
                    }

                    setColumnWidths(newWidths);
                    setIsMeasuring(false);
                },
                100,
            ),
        [],
    );

    useDeepCompareEffect(() => {
        if (!sampledRows.length) {
            return;
        }

        calculateWidths.cancel();
        calculateWidths({
            columnSizing,
            columns,
            measureCellWidth,
            sampledRows,
            tableInstance,
            ...options,
        });
    }, [columnSizing, sampledRows]);

    const columnsWithAutoSizes = React.useMemo(
        () => setColumnAutoSizes(columns, columnWidths, columnSizing),
        [columns, columnWidths, columnSizing],
    );

    return {columnWidths, setTableInstance, columnsWithAutoSizes, isMeasuring};
}
