import React from 'react';

import type {Cell as CellType} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellClassModes, getCellStyles} from '../../utils';
import {b} from '../Table/Table.classname';

export interface CellProps<TData> extends React.TdHTMLAttributes<HTMLTableCellElement> {
    cell?: CellType<TData, unknown>;
}

export const Cell = <TData,>({
    cell,
    children,
    className,
    style,
    ...restProps
}: CellProps<TData>) => {
    return (
        <td
            className={b('cell', getCellClassModes(cell), className)}
            style={getCellStyles(cell, style)}
            {...restProps}
        >
            {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : children}
        </td>
    );
};
