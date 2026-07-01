import type {Table} from '@tanstack/react-table';

export function getCurrentColumnOrder<TData>(table: Table<TData>): string[] {
    const order = table.getState().columnOrder;

    return order.length ? order : table.getAllLeafColumns().map((column) => column.id);
}
