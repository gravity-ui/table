import React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getCellStyles, getHeaderCellClassModes} from '../../utils';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseFooterCellProps<TData, TValue> {
    className?: string;
    header: Header<TData, TValue>;
}

export const BaseFooterCell = <TData, TValue>({
    className,
    header,
}: BaseFooterCellProps<TData, TValue>) => {
    if (header.isPlaceholder) {
        return null;
    }

    const rowSpan = header.depth - header.column.depth;

    return (
        <th
            className={b('footer-cell', getHeaderCellClassModes(header), className)}
            colSpan={header.colSpan > 1 ? header.colSpan : undefined}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            style={getCellStyles(header)}
        >
            {flexRender(header.column.columnDef.footer, header.getContext())}
        </th>
    );
};
