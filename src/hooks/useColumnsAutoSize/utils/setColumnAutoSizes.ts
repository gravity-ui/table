import type {ColumnDef} from '@tanstack/react-table';

import {getColumnId} from './getColumnId';
import {hasDefinedWidth} from './hasDefinedWidth';

export function setColumnAutoSizes<TData extends unknown>(
    columns: ColumnDef<TData>[],
    columnWidths: Record<string, number>,
    columnSizing: Record<string, number>,
    autoMinSize = true,
): ColumnDef<TData>[] {
    if (!Object.keys(columnWidths).length) {
        return columns;
    }

    return columns.map((column) => {
        if ('columns' in column && column.columns)
            return {
                ...column,
                columns: setColumnAutoSizes(
                    column.columns,
                    columnWidths,
                    columnSizing,
                    autoMinSize,
                ),
            };
        const id = getColumnId(column);
        if (!id) return column;

        const hasUserResized = Object.keys(columnSizing).length > 0 && columnSizing[id];

        if (hasUserResized) {
            return {
                ...column,
                size: columnSizing[id],
            };
        }

        if (columnWidths[id] && !hasDefinedWidth(column)) {
            return {
                ...column,
                size: columnWidths[id],
                minSize: autoMinSize ? columnWidths[id] : column.minSize,
            };
        }

        return column;
    });
}
