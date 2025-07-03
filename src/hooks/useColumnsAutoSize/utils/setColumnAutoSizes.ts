import type {ColumnDef} from '@tanstack/react-table';

import {hasDefinedWidth} from './hasDefinedWidth';

export function setColumnAutoSizes<TData extends unknown>(
    columns: ColumnDef<TData>[],
    columnWidths: Record<string, number>,
    columnSizing: Record<string, number>,
): ColumnDef<TData>[] {
    if (!Object.keys(columnWidths).length) {
        return columns;
    }

    return columns.map((column) => {
        const id = column.id || ('accessorKey' in column && String(column.accessorKey)) || '';
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
                minSize: columnWidths[id],
            };
        }

        return column;
    });
}
