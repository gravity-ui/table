import type {TableOptions} from '@tanstack/react-table';
import {
    getCoreRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import type {ColumnDef} from '../types/tanstack';

interface PassedTableOptions<TData>
    extends Omit<TableOptions<TData>, 'getCoreRowModel' | 'columns'> {
    getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
    columns: ColumnDef<TData, any>[];
}

export interface UseTableOptions<TData> extends PassedTableOptions<TData> {}

export const useTable = <TData>(options: UseTableOptions<TData>) => {
    const tableOptions: TableOptions<TData> = {
        ...options,
        enableColumnPinning: options.enableColumnPinning ?? false,
        enableColumnResizing: options.enableColumnResizing ?? false,
        enableExpanding: options.enableExpanding ?? false,
        enableGrouping: options.enableGrouping ?? false,
        enableMultiRowSelection: options.enableMultiRowSelection ?? false,
        enableRowSelection: options.enableRowSelection ?? false,
        enableSorting: options.enableSorting ?? false,
        getCoreRowModel: options.getCoreRowModel ?? getCoreRowModel(),
        getExpandedRowModel: options.enableExpanding
            ? (options.getExpandedRowModel ?? getExpandedRowModel())
            : undefined,
        getGroupedRowModel: options.enableGrouping
            ? (options.getGroupedRowModel ?? getGroupedRowModel())
            : undefined,
        getSortedRowModel: options.enableSorting
            ? (options.getSortedRowModel ?? getSortedRowModel())
            : undefined,
        manualGrouping: options.manualGrouping ?? false,
        manualSorting: options.manualSorting ?? false,
    };

    return useReactTable(tableOptions);
};
