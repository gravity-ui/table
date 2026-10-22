import * as React from 'react';

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
    // Keep default factory identities stable so table render versions change only with input data or state.
    const rowModelFactories = React.useMemo(
        () => ({
            getCoreRowModel: getCoreRowModel<TData>(),
            getExpandedRowModel: getExpandedRowModel<TData>(),
            getGroupedRowModel: getGroupedRowModel<TData>(),
            getSortedRowModel: getSortedRowModel<TData>(),
            getFilteredRowModel: getFilteredRowModel<TData>(),
        }),
        [],
    );

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
        getCoreRowModel: options.getCoreRowModel ?? rowModelFactories.getCoreRowModel,
        getExpandedRowModel: options.enableExpanding
            ? (options.getExpandedRowModel ?? rowModelFactories.getExpandedRowModel)
            : undefined,
        getGroupedRowModel: options.enableGrouping
            ? (options.getGroupedRowModel ?? rowModelFactories.getGroupedRowModel)
            : undefined,
        getSortedRowModel: options.enableSorting
            ? (options.getSortedRowModel ?? rowModelFactories.getSortedRowModel)
            : undefined,
        getFilteredRowModel:
            options.enableColumnFilters || options.enableGlobalFilter
                ? (options.getFilteredRowModel ?? rowModelFactories.getFilteredRowModel)
                : undefined,
        manualGrouping: options.manualGrouping ?? false,
        manualSorting: options.manualSorting ?? false,
        manualFiltering: options.manualFiltering ?? false,
    };

    return useReactTable(tableOptions);
};
