import type {ColumnDef} from '@tanstack/react-table';

export function hasDefinedWidth<TData extends unknown>(column: ColumnDef<TData>) {
    return (
        typeof column.size === 'number' ||
        (typeof column.minSize === 'number' &&
            typeof column.maxSize === 'number' &&
            column.minSize === column.maxSize)
    );
}
