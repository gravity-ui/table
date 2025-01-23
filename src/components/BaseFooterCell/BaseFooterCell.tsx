import type * as React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellStyles, getHeaderCellClassModes} from '../../utils';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseFooterCellProps<TData, TValue> {
    header: Header<TData, TValue>;
    attributes?:
        | React.ThHTMLAttributes<HTMLTableCellElement>
        | ((header: Header<TData, TValue>) => React.ThHTMLAttributes<HTMLTableCellElement>);
    className?: string | ((header: Header<TData, TValue>) => string);
}

export const BaseFooterCell = <TData, TValue>({
    header,
    attributes: attributesProp,
    className: classNameProp,
}: BaseFooterCellProps<TData, TValue>) => {
    const attributes =
        typeof attributesProp === 'function' ? attributesProp(header) : attributesProp;

    const className = typeof classNameProp === 'function' ? classNameProp(header) : classNameProp;

    const rowSpan = header.depth - header.column.depth;

    return (
        <th
            className={b('footer-cell', getHeaderCellClassModes(header), className)}
            colSpan={header.colSpan > 1 ? header.colSpan : undefined}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            {...attributes}
            style={getCellStyles(header, attributes?.style)}
        >
            {flexRender(header.column.columnDef.footer, header.getContext())}
        </th>
    );
};
