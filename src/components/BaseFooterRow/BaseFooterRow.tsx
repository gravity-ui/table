import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';

import type {BaseFooterCellProps} from '../BaseFooterCell';
import {BaseFooterCell} from '../BaseFooterCell';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseFooterRowProps<TData, TValue>
    extends React.TdHTMLAttributes<HTMLTableRowElement> {
    cellClassName: BaseFooterCellProps<TData, TValue>['className'];
    className?: string;
    footerGroup: HeaderGroup<TData>;
}

export const BaseFooterRow = <TData, TValue>({
    cellClassName,
    className,
    footerGroup,
    ...restProps
}: BaseFooterRowProps<TData, TValue>) => {
    const isEmptyRow = footerGroup.headers.every((header) => !header.column.columnDef.footer);

    if (isEmptyRow) {
        return null;
    }

    return (
        <tr className={b('footer-row', className)} {...restProps}>
            {footerGroup.headers.map((header) => (
                <BaseFooterCell key={header.column.id} className={cellClassName} header={header} />
            ))}
        </tr>
    );
};
