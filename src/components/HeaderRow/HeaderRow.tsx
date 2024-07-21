import React from 'react';

import type {Header, HeaderGroup} from '@tanstack/react-table';

import type {HeaderCellProps} from '../HeaderCell';
import {HeaderCell} from '../HeaderCell';
import type {ResizeHandleProps} from '../ResizeHandle';
import {b} from '../Table/Table.classname';

export interface HeaderRowProps<TData, TValue> {
    cellClassName: HeaderCellProps<TData, TValue>['className'];
    className?: string;
    headerGroup: HeaderGroup<TData>;
    parentHeaderGroup?: HeaderGroup<TData>;
    renderResizeHandle?: (props: ResizeHandleProps<TData, TValue>) => React.ReactNode;
    renderSortIndicator: HeaderCellProps<TData, TValue>['renderSortIndicator'];
    resizeHandleClassName?: HeaderCellProps<TData, TValue>['resizeHandleClassName'];
    sortIndicatorClassName: HeaderCellProps<TData, TValue>['sortIndicatorClassName'];
}

export const HeaderRow = <TData, TValue>({
    cellClassName,
    className,
    headerGroup,
    parentHeaderGroup,
    renderResizeHandle,
    renderSortIndicator,
    resizeHandleClassName,
    sortIndicatorClassName,
}: HeaderRowProps<TData, TValue>) => {
    return (
        <tr className={b('header-row', className)}>
            {headerGroup.headers.map((header) => (
                <HeaderCell
                    key={header.column.id}
                    className={cellClassName}
                    header={header as Header<TData, TValue>}
                    parentHeader={parentHeaderGroup?.headers.find(
                        (item) => header.column.id === item.column.id,
                    )}
                    renderResizeHandle={renderResizeHandle}
                    renderSortIndicator={renderSortIndicator}
                    resizeHandleClassName={resizeHandleClassName}
                    sortIndicatorClassName={sortIndicatorClassName}
                />
            ))}
        </tr>
    );
};
