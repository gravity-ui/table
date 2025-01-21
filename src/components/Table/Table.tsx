import * as React from 'react';

import type {Cell} from '../../tanstack';
import {BaseTable} from '../BaseTable';
import type {BaseTableProps} from '../BaseTable';

import {b} from './Table.classname';
import type {TableSize} from './types';

import './Table.scss';

type VerticalAlignment = 'top' | 'middle' | 'bottom';

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
            onRowClick,
            verticalAlign = 'top',
            headerVerticalAlign = 'top',
            footerVerticalAlign = 'top',
            ...props
        }: TableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const cellClassName: (cell?: Cell<TData, unknown>) => string = React.useCallback(
            (cell) => {
                if (!cell) {
                    return b('cell');
                }

                const hasSubRows = cell.row.subRows?.length > 0;
                const expanded = cell.row.getIsExpanded();
                const isSubRow = cell.row.parentId !== undefined;
                const isLastInGroup =
                    cell.row.index === (cell.row.getParentRow()?.subRows?.length ?? 1) - 1;
                const isLastLeaf = cell.row.getLeafRows().at(-1)?.id === cell.row.id;

                let modifiers: Record<string, string | boolean> = {
                    'vertical-align': verticalAlign,
                };
                let additionalClassName;

                if ((hasSubRows && expanded) || (isSubRow && !isLastInGroup && !isLastLeaf)) {
                    modifiers = {'no-border': true};
                }

                if (typeof cellClassNameProp === 'function') {
                    additionalClassName = cellClassNameProp(cell);
                }

                return b('cell', modifiers, additionalClassName);
            },
            [cellClassNameProp, verticalAlign],
        );

        const headerCellClassName: TableProps<TData>['headerCellClassName'] = React.useMemo(() => {
            const modifiers = {
                'vertical-align': headerVerticalAlign,
            };
            if (typeof headerCellClassNameProp === 'function') {
                return (...args) => b('header-cell', modifiers, headerCellClassNameProp(...args));
            }

            return b('header-cell', modifiers, headerCellClassNameProp);
        }, [headerCellClassNameProp, headerVerticalAlign]);

        const footerCellClassName: TableProps<TData>['footerCellClassName'] = React.useMemo(() => {
            const modifiers = {
                'vertical-align': footerVerticalAlign,
            };
            if (typeof footerCellClassNameProp === 'function') {
                return (...args) => b('footer-cell', modifiers, footerCellClassNameProp(...args));
            }

            return b('footer-cell', modifiers, footerCellClassNameProp);
        }, [footerCellClassNameProp, footerVerticalAlign]);

        const rowClassName: TableProps<TData>['rowClassName'] = React.useMemo(() => {
            const modifiers = {interactive: Boolean(onRowClick)};

            if (typeof rowClassNameProp === 'function') {
                return (...args) => b('row', modifiers, rowClassNameProp(...args));
            }

            return b('row', modifiers, rowClassNameProp);
        }, [onRowClick, rowClassNameProp]);

        return (
            <BaseTable
                ref={ref}
                className={b({size}, className)}
                cellClassName={cellClassName}
                footerCellClassName={footerCellClassName}
                headerCellClassName={headerCellClassName}
                headerClassName={b('header', headerClassName)}
                rowClassName={rowClassName}
                onRowClick={onRowClick}
                {...props}
            />
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: TableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

Table.displayName = 'Table';
