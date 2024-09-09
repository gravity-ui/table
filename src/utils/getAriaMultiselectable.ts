import type {Table} from '@tanstack/table-core/build/lib/types';

export const getAriaMultiselectable = <TData>(table: Table<TData>) => {
    if (table.options.enableRowSelection) {
        return Boolean(table.options.enableMultiRowSelection);
    }

    return undefined;
};
