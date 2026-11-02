import * as React from 'react';

import {flexRender} from '@tanstack/react-table';
import type {CellContext, ColumnDef, Row} from '@tanstack/react-table';

import {useTable} from '../../useTable';

export function getValueFromCell<TData extends unknown>(
    tableInstance: ReturnType<typeof useTable<TData>> | null,
    column: ColumnDef<TData>,
    row: Row<TData>,
): React.ReactNode {
    try {
        if (column.cell) {
            const getValue = () => {
                if ('accessorKey' in column) {
                    return row.original[column.accessorKey as keyof TData];
                }

                if ('accessorFn' in column) {
                    return column.accessorFn(row.original, 0);
                }

                return undefined;
            };

            const context = {
                table: tableInstance || {},
                row,
                column: column,
                getValue,
                renderValue: () => getValue(),
            };

            return flexRender(
                column.cell,
                context as unknown as CellContext<TData, unknown>,
            ) as React.ReactNode;
        }

        let value;

        if ('accessorKey' in column) {
            value = row.original[column.accessorKey as keyof TData];
        } else if ('accessorFn' in column) {
            value = column.accessorFn(row.original, 0);
        } else {
            return '';
        }

        if (
            value !== null &&
            value !== undefined &&
            typeof value === 'object' &&
            !React.isValidElement(value)
        ) {
            try {
                if (value instanceof Date) {
                    return value.toLocaleString();
                }

                const stringified = JSON.stringify(value);

                if (stringified.length > 30) {
                    return stringified.slice(0, 27) + '...';
                }

                return stringified;
            } catch {
                return '[Object]';
            }
        }

        return value as React.ReactNode;
    } catch {
        return '';
    }
}
