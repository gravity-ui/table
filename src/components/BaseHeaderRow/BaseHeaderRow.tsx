import React from 'react';

import type {Header, HeaderGroup} from '@tanstack/react-table';

import {shouldRenderHeaderCell} from '../../utils';
import type {BaseHeaderCellProps} from '../BaseHeaderCell';
import {BaseHeaderCell} from '../BaseHeaderCell';
import type {BaseResizeHandleProps} from '../BaseResizeHandle';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseHeaderRowProps<TData, TValue = unknown>
    extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'className'> {
    cellClassName?: BaseHeaderCellProps<TData, TValue>['className'];
    className?:
        | string
        | ((headerGroup: HeaderGroup<TData>, parentHeaderGroup?: HeaderGroup<TData>) => string);
    headerGroup: HeaderGroup<TData>;
    parentHeaderGroup?: HeaderGroup<TData>;
    renderResizeHandle?: (props: BaseResizeHandleProps<TData, TValue>) => React.ReactNode;
    renderSortIndicator: BaseHeaderCellProps<TData, TValue>['renderSortIndicator'];
    resizeHandleClassName?: BaseHeaderCellProps<TData, TValue>['resizeHandleClassName'];
    sortIndicatorClassName: BaseHeaderCellProps<TData, TValue>['sortIndicatorClassName'];
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((
              headerGroup: HeaderGroup<TData>,
              parentHeaderGroup?: HeaderGroup<TData>,
          ) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: BaseHeaderCellProps<TData, TValue>['attributes'];
}

export const BaseHeaderRow = <TData, TValue = unknown>({
    cellClassName,
    className: classNameProp,
    headerGroup,
    parentHeaderGroup,
    renderResizeHandle,
    renderSortIndicator,
    resizeHandleClassName,
    sortIndicatorClassName,
    attributes: attributesProp,
    cellAttributes,
    ...restProps
}: BaseHeaderRowProps<TData, TValue>) => {
    const attributes =
        typeof attributesProp === 'function'
            ? attributesProp(headerGroup, parentHeaderGroup)
            : attributesProp;

    const className =
        typeof classNameProp === 'function'
            ? classNameProp(headerGroup, parentHeaderGroup)
            : classNameProp;

    return (
        <tr className={b('header-row', className)} {...restProps} {...attributes}>
            {headerGroup.headers.map((header) => {
                const parentHeader = parentHeaderGroup?.headers.find(
                    (item) => header.column.id === item.column.id,
                );

                return shouldRenderHeaderCell(header, parentHeader) ? (
                    <BaseHeaderCell
                        key={header.column.id}
                        className={cellClassName}
                        header={header as Header<TData, TValue>}
                        parentHeader={parentHeader}
                        renderResizeHandle={renderResizeHandle}
                        renderSortIndicator={renderSortIndicator}
                        resizeHandleClassName={resizeHandleClassName}
                        sortIndicatorClassName={sortIndicatorClassName}
                        attributes={cellAttributes}
                    />
                ) : null;
            })}
        </tr>
    );
};
