import * as React from 'react';

import {flexRender} from '@tanstack/react-table';
import type {CellContext, ColumnDef, Row} from '@tanstack/react-table';

import {useTable} from '../../useTable';

import {getColumnId} from './getColumnId';

export function getValueFromCell<TData extends unknown>(
    tableInstance: ReturnType<typeof useTable<TData>> | null,
    column: ColumnDef<TData>,
    row: Row<TData>,
): React.ReactNode {
    try {
        const getValue = () => {
            if (typeof row.getValue === 'function') return row.getValue(getColumnId(column));
            if ('accessorFn' in column) return column.accessorFn(row.original, row.index ?? 0);
            if ('accessorKey' in column) {
                return String(column.accessorKey)
                    .split('.')
                    .reduce<unknown>(
                        (value, key) =>
                            value === null || value === undefined
                                ? undefined
                                : (value as Record<string, unknown>)[key],
                        row.original,
                    );
            }
            return undefined;
        };
        if (column.cell) {
            const context = {
                table: tableInstance || {},
                row,
                column: {...column, id: getColumnId(column)},
                getValue,
                renderValue: getValue,
            };
            return flexRender(
                column.cell,
                context as unknown as CellContext<TData, unknown>,
            ) as React.ReactNode;
        }
        const value = getValue();

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
