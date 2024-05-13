import React from 'react';

import type {Header, HeaderGroup} from '@tanstack/react-table';

import type {HeaderCellProps} from '../HeaderCell';
import {HeaderCell} from '../HeaderCell';
import {b} from '../Table/Table.classname';

export interface HeaderRowProps<TData, TValue> {
    cellClassName: HeaderCellProps<TData, TValue>['className'];
    cellContentClassName: HeaderCellProps<TData, TValue>['contentClassName'];
    className?: string;
    headerGroup: HeaderGroup<TData>;
    renderSortIndicator: HeaderCellProps<TData, TValue>['renderSortIndicator'];
    selectionColumnId?: string;
    sortIndicatorClassName: HeaderCellProps<TData, TValue>['sortIndicatorClassName'];
}

export const HeaderRow = <TData, TValue>({
    cellClassName,
    cellContentClassName,
    className,
    headerGroup,
    renderSortIndicator,
    selectionColumnId,
    sortIndicatorClassName,
}: HeaderRowProps<TData, TValue>) => {
    return (
        <tr className={b('header-row', className)}>
            {headerGroup.headers.map((header) => (
                <HeaderCell
                    key={header.column.id}
                    className={cellClassName}
                    contentClassName={cellContentClassName}
                    header={header as Header<TData, TValue>}
                    renderSortIndicator={renderSortIndicator}
                    selection={header.column.id === selectionColumnId}
                    sortIndicatorClassName={sortIndicatorClassName}
                />
            ))}
        </tr>
    );
};
