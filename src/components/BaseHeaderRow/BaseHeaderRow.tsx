import React from 'react';

import type {Header, HeaderGroup} from '@tanstack/react-table';

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
    const attributes = React.useMemo(() => {
        return typeof attributesProp === 'function'
            ? attributesProp(headerGroup, parentHeaderGroup)
            : attributesProp;
    }, [attributesProp, headerGroup, parentHeaderGroup]);

    const className = React.useMemo(() => {
        return typeof classNameProp === 'function'
            ? classNameProp(headerGroup, parentHeaderGroup)
            : classNameProp;
    }, [classNameProp, headerGroup, parentHeaderGroup]);

    return (
        <tr className={b('header-row', className)} {...restProps} {...attributes}>
            {headerGroup.headers.map((header) => (
                <BaseHeaderCell
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
                    attributes={cellAttributes}
                />
            ))}
        </tr>
    );
};
