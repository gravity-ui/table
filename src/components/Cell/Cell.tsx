import React from 'react';

import type {Cell as CellProperties} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {b} from '../Table/Table.classname';

export interface CellProps<TData> {
    cell: CellProperties<TData, unknown>;
    className?: string;
    contentClassName?: string;
    selectionColumnId?: string;
}

export const Cell = <TData,>({
    cell,
    className,
    contentClassName,
    selectionColumnId,
}: CellProps<TData>) => {
    return (
        <td
            className={b('cell', {id: cell.column.id}, className)}
            style={{
                width: cell.column.getSize(),
                minWidth: cell.column.columnDef.minSize,
                maxWidth: cell.column.columnDef.maxSize,
            }}
        >
            <div
                className={b(
                    'cell-content',
                    {selection: cell.column.id === selectionColumnId},
                    contentClassName,
                )}
            >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
        </td>
    );
};
