import type {ColumnDef} from '@tanstack/react-table';

import type {ColumnAutoSize} from '../types';

export function getColumnAutoSize<T>(column: ColumnDef<T>): ColumnAutoSize<T> | undefined {
    return (column.meta as {autoSize?: ColumnAutoSize<T>} | undefined)?.autoSize;
}

export function getColumnId<T>(column: ColumnDef<T>): string {
    if (getColumnAutoSize(column) === undefined) {
        return column.id || ('accessorKey' in column && String(column.accessorKey)) || '';
    }
    if (column.id !== undefined) return column.id;
    if ('accessorKey' in column && column.accessorKey)
        return String(column.accessorKey).replace(/\./g, '_');
    return typeof column.header === 'string' ? column.header : '';
}

export function getLeafColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
    return columns.flatMap((column) =>
        'columns' in column && column.columns ? getLeafColumns(column.columns) : [column],
    );
}

export function getMeasurementColumns<T>(columns: ColumnDef<T>[]) {
    return columns.map((column) => ({
        id: getColumnId(column),
        size: column.size,
        minSize: column.minSize,
        maxSize: column.maxSize,
        header: typeof column.header === 'string' ? column.header : undefined,
        headerKind:
            column.header === null || column.header === undefined
                ? 'none'
                : typeof column.header === 'string'
                  ? 'text'
                  : 'custom',
        autoSize: getColumnAutoSize(column),
    }));
}

export function hasAutoSizeColumns<T>(columns: ColumnDef<T>[]): boolean {
    return columns.some(
        (column) =>
            getColumnAutoSize(column) !== undefined ||
            ('columns' in column && Boolean(column.columns && hasAutoSizeColumns(column.columns))),
    );
}
