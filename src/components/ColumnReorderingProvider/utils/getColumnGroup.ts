import type {Table} from '@tanstack/react-table';

export function getColumnGroup<TData>(
    table: Table<TData>,
    columnId: string,
): 'left' | 'right' | 'center' {
    return table.getColumn(columnId)?.getIsPinned() || 'center';
}
