import React from 'react';

import {BaseTable} from '../BaseTable';
import type {BaseTableProps} from '../BaseTable';

import {b} from './Table.classname';

import './Table.scss';

export interface TableProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends BaseTableProps<TData, TScrollElement> {}

export const Table = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            className,
            cellClassName: cellClassNameProp,
            footerCellClassName,
            headerCellClassName: headerCellClassNameProp,
            headerClassName,
            ...props
        }: TableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const cellClassName: TableProps<TData>['cellClassName'] = React.useMemo(() => {
            if (typeof cellClassNameProp === 'function') {
                return (...params) => b('cell', cellClassNameProp(...params));
            }
            return b('cell', cellClassNameProp);
        }, [cellClassNameProp]);

        const headerCellClassName: TableProps<TData>['headerCellClassName'] = React.useMemo(() => {
            if (typeof headerCellClassNameProp === 'function') {
                return (...params) => b('header-cell', headerCellClassNameProp(...params));
            }
            return b('header-cell', headerCellClassNameProp);
        }, [headerCellClassNameProp]);

        return (
            <BaseTable
                ref={ref}
                className={b(null, className)}
                cellClassName={cellClassName}
                footerCellClassName={b('footer-cell', footerCellClassName)}
                headerCellClassName={headerCellClassName}
                headerClassName={b('header', headerClassName)}
                {...props}
            />
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: TableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

Table.displayName = 'Table';
