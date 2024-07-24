import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';

import type {FooterCellProps} from '../FooterCell';
import {FooterCell} from '../FooterCell';
import {b} from '../Table/Table.classname';

export interface FooterRowProps<TData, TValue> {
    cellClassName: FooterCellProps<TData, TValue>['className'];
    className?: string;
    footerGroup: HeaderGroup<TData>;
}

export const FooterRow = <TData, TValue>({
    cellClassName,
    className,
    footerGroup,
}: FooterRowProps<TData, TValue>) => {
    const isEmptyRow = footerGroup.headers.every((header) => !header.column.columnDef.footer);

    if (isEmptyRow) {
        return null;
    }

    return (
        <tr className={b('footer-row', className)}>
            {footerGroup.headers.map((header) => (
                <FooterCell key={header.column.id} className={cellClassName} header={header} />
            ))}
        </tr>
    );
};
