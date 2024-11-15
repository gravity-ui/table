import React from 'react';

import {BaseTable} from '../BaseTable';
import type {BaseTableProps} from '../BaseTable';

import {b} from './Table.classname';
import type {TableSize} from './types';

import './Table.scss';

export interface TableProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends BaseTableProps<TData, TScrollElement> {
    /** Table size */
    size?: TableSize;
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
            ...props
        }: TableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const cellClassName: TableProps<TData>['cellClassName'] = React.useMemo(() => {
            if (typeof cellClassNameProp === 'function') {
                return (...args) => b('cell', cellClassNameProp(...args));
            }

            return b('cell', cellClassNameProp);
        }, [cellClassNameProp]);

        const headerCellClassName: TableProps<TData>['headerCellClassName'] = React.useMemo(() => {
            if (typeof headerCellClassNameProp === 'function') {
                return (...args) => b('header-cell', headerCellClassNameProp(...args));
            }

            return b('header-cell', headerCellClassNameProp);
        }, [headerCellClassNameProp]);

        const footerCellClassName: TableProps<TData>['footerCellClassName'] = React.useMemo(() => {
            if (typeof footerCellClassNameProp === 'function') {
                return (...args) => b('footer-cell', footerCellClassNameProp(...args));
            }

            return b('footer-cell', footerCellClassNameProp);
        }, [footerCellClassNameProp]);

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
