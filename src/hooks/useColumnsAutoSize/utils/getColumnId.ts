import type {ColumnDef} from '@tanstack/react-table';

export function getColumnId<T>(column: ColumnDef<T>): string {
    if (column.meta?.autoSize === undefined) {
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
        autoSize: column.meta?.autoSize,
    }));
}
