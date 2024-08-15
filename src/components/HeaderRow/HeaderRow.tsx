import React from 'react';

import type {Header, HeaderGroup} from '@tanstack/react-table';

import type {HeaderCellProps} from '../HeaderCell';
import {HeaderCell} from '../HeaderCell';
import type {ResizeHandleProps} from '../ResizeHandle';
import {b} from '../Table/Table.classname';

export interface HeaderRowProps<TData, TValue>
    extends Omit<React.TdHTMLAttributes<HTMLTableRowElement>, 'className'> {
    cellClassName?: HeaderCellProps<TData, TValue>['className'];
    className?:
        | string
        | ((headerGroup: HeaderGroup<TData>, parentHeaderGroup?: HeaderGroup<TData>) => string);
    headerGroup: HeaderGroup<TData>;
    parentHeaderGroup?: HeaderGroup<TData>;
    renderResizeHandle?: (props: ResizeHandleProps<TData, TValue>) => React.ReactNode;
    renderSortIndicator: HeaderCellProps<TData, TValue>['renderSortIndicator'];
    resizeHandleClassName?: HeaderCellProps<TData, TValue>['resizeHandleClassName'];
    sortIndicatorClassName: HeaderCellProps<TData, TValue>['sortIndicatorClassName'];
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((
              headerGroup: HeaderGroup<TData>,
              parentHeaderGroup?: HeaderGroup<TData>,
          ) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: HeaderCellProps<TData, TValue>['attributes'];
}

export const HeaderRow = <TData, TValue>({
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
}: HeaderRowProps<TData, TValue>) => {
    const className = React.useMemo(() => {
        return typeof classNameProp === 'function'
            ? classNameProp(headerGroup, parentHeaderGroup)
            : classNameProp;
    }, [classNameProp, headerGroup, parentHeaderGroup]);

    const attributes =
        typeof attributesProp === 'function'
            ? attributesProp(headerGroup, parentHeaderGroup)
            : attributesProp;

    return (
        <tr className={b('header-row', className)} {...restProps} {...attributes}>
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
                    attributes={cellAttributes}
                />
            ))}
        </tr>
    );
};
