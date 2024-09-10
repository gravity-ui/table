import React from 'react';

import type {Cell} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellClassModes, getCellStyles} from '../../utils';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseCellProps<TData>
    extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'className'> {
    cell?: Cell<TData, unknown>;
    className?: string | ((cell?: Cell<TData, unknown>) => string);
    attributes?:
        | React.TdHTMLAttributes<HTMLTableCellElement>
        | ((cell?: Cell<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>);
}

export const BaseCell = <TData,>({
    cell,
    children,
    className: classNameProp,
    style,
    attributes: attributesProp,
    ...restProps
}: BaseCellProps<TData>) => {
    const attributes = typeof attributesProp === 'function' ? attributesProp(cell) : attributesProp;
    const className = typeof classNameProp === 'function' ? classNameProp(cell) : classNameProp;

    return (
        <td
            className={b('cell', getCellClassModes(cell), className)}
            {...restProps}
            {...attributes}
            style={getCellStyles(cell, {...style, ...attributes?.style})}
        >
            {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : children}
        </td>
    );
};
