import type {Table as TableType} from '@tanstack/table-core/build/lib/types';

export const getAriaMultiselectable = <TData>(table: TableType<TData>) => {
    if (table.options.enableRowSelection) {
        return Boolean(table.options.enableMultiRowSelection);
    }

    return undefined;
};
