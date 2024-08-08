import React from 'react';

import type {Cell as CellType} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellClassModes, getCellStyles} from '../../utils';
import {b} from '../Table/Table.classname';

export interface CellProps<TData>
    extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'className'> {
    cell?: CellType<TData, unknown>;
    className?: string | ((cell?: CellType<TData, unknown>) => string);
    attributes?:
        | React.TdHTMLAttributes<HTMLTableCellElement>
        | ((cell?: CellType<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>);
}

export const Cell = <TData,>({
    cell,
    children,
    className: classNameProp,
    style,
    attributes: getAttributes,
    ...restProps
}: CellProps<TData>) => {
    const className = React.useMemo(() => {
        return typeof classNameProp === 'function' ? classNameProp(cell) : classNameProp;
    }, [cell, classNameProp]);

    const attributes = typeof getAttributes === 'function' ? getAttributes(cell) : getAttributes;

    return (
        <td
            className={b('cell', getCellClassModes(cell), className)}
            style={getCellStyles(cell, style)}
            {...restProps}
            {...attributes}
        >
            {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : children}
        </td>
    );
};
