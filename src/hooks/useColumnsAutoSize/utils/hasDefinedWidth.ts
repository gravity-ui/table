import type {ColumnDef} from '@tanstack/react-table';

export function getDefinedWidth<T>(column: ColumnDef<T>): number | undefined {
    if (typeof column.size === 'number') return column.size;
    if (
        typeof column.minSize === 'number' &&
        typeof column.maxSize === 'number' &&
        column.minSize === column.maxSize
    )
        return column.minSize;
    return undefined;
}
export function hasDefinedWidth<T>(column: ColumnDef<T>) {
    return getDefinedWidth(column) !== undefined;
}
