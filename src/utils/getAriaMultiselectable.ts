import type {Table} from '@tanstack/react-table';

export const getAriaMultiselectable = <TData>(table: Table<TData>) => {
    if (table.options.enableRowSelection) {
        return Boolean(table.options.enableMultiRowSelection);
    }

    return undefined;
};
