import React from 'react';

import {BaseTable} from '../BaseTable';
import type {BaseTableProps} from '../BaseTable';

import {b} from './Table.classname';
import type {TableSize} from './types';

import './Table.scss';

type VerticalAlignment = 'top' | 'center' | 'bottom';

export interface TableProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends BaseTableProps<TData, TScrollElement> {
    /** Table size */
    size?: TableSize;
    /** Row vertical align */
    verticalAlign?: VerticalAlignment;
    headerVerticalAlign?: VerticalAlignment;
    footerVerticalAlign?: VerticalAlignment;
}

export const Table = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            className,
            cellClassName: cellClassNameProp,
            footerCellClassName: footerCellClassNameProp,
            headerCellClassName: headerCellClassNameProp,
            rowClassName: rowClassNameProp,
            headerClassName,
            size = 'm',
            verticalAlign = 'top',
            headerVerticalAlign = 'top',
            footerVerticalAlign = 'top',
            ...props
        }: TableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const cellClassName: TableProps<TData>['cellClassName'] = React.useMemo(() => {
            const mod = {
                'vertical-align': verticalAlign,
            };
            if (typeof cellClassNameProp === 'function') {
                return (...args) => b('cell', mod, cellClassNameProp(...args));
            }

            return b('cell', mod, cellClassNameProp);
        }, [cellClassNameProp, verticalAlign]);

        const headerCellClassName: TableProps<TData>['headerCellClassName'] = React.useMemo(() => {
            const mod = {
                'vertical-align': headerVerticalAlign,
            };
            if (typeof headerCellClassNameProp === 'function') {
                return (...args) => b('header-cell', mod, headerCellClassNameProp(...args));
            }

            return b('header-cell', mod, headerCellClassNameProp);
        }, [headerCellClassNameProp, headerVerticalAlign]);

        const footerCellClassName: TableProps<TData>['footerCellClassName'] = React.useMemo(() => {
            const mod = {
                'vertical-align': footerVerticalAlign,
            };
            if (typeof footerCellClassNameProp === 'function') {
                return (...args) => b('footer-cell', mod, footerCellClassNameProp(...args));
            }

            return b('footer-cell', mod, footerCellClassNameProp);
        }, [footerCellClassNameProp, footerVerticalAlign]);

        const rowClassName: TableProps<TData>['rowClassName'] = React.useMemo(() => {
            if (typeof rowClassNameProp === 'function') {
                return (...args) => b('row', rowClassNameProp(...args));
            }

            return b('row', rowClassNameProp);
        }, [rowClassNameProp]);

        return (
            <BaseTable
                ref={ref}
                className={b({size}, className)}
                cellClassName={cellClassName}
                footerCellClassName={footerCellClassName}
                headerCellClassName={headerCellClassName}
                headerClassName={b('header', headerClassName)}
                rowClassName={rowClassName}
                {...props}
            />
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: TableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

Table.displayName = 'Table';
