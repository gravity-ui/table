import React from 'react';

import type {Cell as CellProperties} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellClassModes} from '../../utils/getCellClassModes';
import {getCellStyles} from '../../utils/getCellStyles';
import {b} from '../Table/Table.classname';

export interface CellProps<TData> {
    cell: CellProperties<TData, unknown>;
    className?: string;
    contentClassName?: string;
}

export const Cell = <TData,>({cell, className, contentClassName}: CellProps<TData>) => {
    return (
        <td className={b('cell', getCellClassModes(cell), className)} style={getCellStyles(cell)}>
            <div className={b('cell-content', contentClassName)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
        </td>
    );
};
