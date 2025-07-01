import * as React from 'react';

import {flexRender} from '@tanstack/react-table';
import type {ColumnDef, HeaderContext} from '@tanstack/react-table';

import {useTable} from '../../useTable';
import {cellDefaultWidth} from '../constants';

export async function renderHeaderContent<TData extends unknown>(
    tableInstance: ReturnType<typeof useTable<TData>> | null,
    column: ColumnDef<TData>,
): Promise<React.ReactNode> {
    try {
        if (!column.header) {
            return '';
        }

        if (typeof column.header === 'function') {
            const id = column.id || ('accessorKey' in column && String(column.accessorKey)) || '';

            const headerContext = {
                column: {
                    ...column,
                    id,
                    getSize: () => column.size || cellDefaultWidth,
                },
                header: {
                    id,
                    column: column,
                    isPlaceholder: false,
                    placeholderId: undefined,
                    getContext: () => headerContext,
                    depth: 0,
                    index: 0,
                    colSpan: 1,
                    rowSpan: 1,
                    subHeaders: [],
                    getSize: () => column.size || cellDefaultWidth,
                },
                table: tableInstance || {
                    getSortedRowModel: () => ({rows: []}),
                    getState: () => ({sorting: []}),
                    getHeaderGroups: () => [],
                    getAllColumns: () => [],
                    options: {enableSorting: false},
                },
                sortDescriptor: null,
                sortDirection: null,
            };

            const renderedHeader = flexRender(
                column.header,
                headerContext as unknown as HeaderContext<TData, unknown>,
            ) as Promise<React.ReactNode> | React.ReactNode;

            if (renderedHeader instanceof Promise) {
                return await renderedHeader;
            }

            return renderedHeader;
        }

        return column.header;
    } catch {
        return column.id || ('accessorKey' in column && String(column.accessorKey)) || 'Header';
    }
}
