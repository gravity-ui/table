import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';

import type {BaseFooterCellProps} from '../BaseFooterCell';
import {BaseFooterCell} from '../BaseFooterCell';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseFooterRowProps<TData, TValue = unknown>
    extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'className'> {
    footerGroup: HeaderGroup<TData>;
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((footerGroup: HeaderGroup<TData>) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: BaseFooterCellProps<TData, TValue>['attributes'];
    cellClassName?: BaseFooterCellProps<TData, TValue>['className'];
    className?: string | ((footerGroup: HeaderGroup<TData>) => string);
}

export const BaseFooterRow = <TData, TValue = unknown>({
    footerGroup,
    attributes: attributesProp,
    cellAttributes,
    cellClassName,
    className: classNameProp,
    ...restProps
}: BaseFooterRowProps<TData, TValue>) => {
    const attributes = React.useMemo(() => {
        return typeof attributesProp === 'function' ? attributesProp(footerGroup) : attributesProp;
    }, [attributesProp, footerGroup]);

    const className = React.useMemo(() => {
        return typeof classNameProp === 'function' ? classNameProp(footerGroup) : classNameProp;
    }, [classNameProp, footerGroup]);

    const isEmptyRow = footerGroup.headers.every((header) => !header.column.columnDef.footer);

    if (isEmptyRow) {
        return null;
    }

    return (
        <tr className={b('footer-row', className)} {...restProps} {...attributes}>
            {footerGroup.headers.map((header) => (
                <BaseFooterCell
                    key={header.column.id}
                    header={header}
                    attributes={cellAttributes}
                    className={cellClassName}
                />
            ))}
        </tr>
    );
};
