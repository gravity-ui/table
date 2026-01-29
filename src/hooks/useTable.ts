import type {TableOptions} from '@tanstack/react-table';
import {
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import type {UseTableOptions} from '../types/base';

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
        enableColumnFilters: options.enableColumnFilters ?? false,
        enableGlobalFilter: options.enableGlobalFilter ?? false,
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
        getFilteredRowModel:
            options.enableColumnFilters || options.enableGlobalFilter
                ? (options.getFilteredRowModel ?? getFilteredRowModel())
                : undefined,
        manualGrouping: options.manualGrouping ?? false,
        manualSorting: options.manualSorting ?? false,
        manualFiltering: options.manualFiltering ?? false,
    };

    return useReactTable(tableOptions);
};
