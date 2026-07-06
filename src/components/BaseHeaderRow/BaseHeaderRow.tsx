import * as React from 'react';

import type {Header, HeaderGroup} from '../../types/base';
import {shouldRenderHeaderCell} from '../../utils';
import {BaseDraggableHeaderCell} from '../BaseDraggableHeaderCell';
import type {BaseHeaderCellProps} from '../BaseHeaderCell';
import {BaseHeaderCell} from '../BaseHeaderCell';
import type {BaseResizeHandleProps} from '../BaseResizeHandle';
import {b} from '../BaseTable/BaseTable.classname';
import {ColumnReorderingContext} from '../ColumnReorderingContext';

import {getCanReorderHeader} from './utils/getCanReorderHeader';

export interface BaseHeaderRowProps<TData, TValue = unknown>
    extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'className'> {
    cellClassName?: BaseHeaderCellProps<TData, TValue>['className'];
    className?:
        | string
        | ((headerGroup: HeaderGroup<TData>, parentHeaderGroup?: HeaderGroup<TData>) => string);
    headerGroup: HeaderGroup<TData>;
    parentHeaderGroup?: HeaderGroup<TData>;
    renderHeaderCellContent?: BaseHeaderCellProps<TData, TValue>['renderHeaderCellContent'];
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
    renderHeaderCellContent,
    renderResizeHandle,
    renderSortIndicator,
    resizeHandleClassName,
    sortIndicatorClassName,
    attributes: attributesProp,
    cellAttributes,
    ...restProps
}: BaseHeaderRowProps<TData, TValue>) => {
    const columnReordering = React.useContext(ColumnReorderingContext);

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

                if (!shouldRenderHeaderCell(header, parentHeader)) {
                    return null;
                }

                const HeaderCellComponent =
                    columnReordering && getCanReorderHeader(header)
                        ? BaseDraggableHeaderCell
                        : BaseHeaderCell;

                return (
                    <HeaderCellComponent
                        key={header.column.id}
                        className={cellClassName}
                        header={header as Header<TData, TValue>}
                        parentHeader={parentHeader}
                        renderHeaderCellContent={renderHeaderCellContent}
                        renderResizeHandle={renderResizeHandle}
                        renderSortIndicator={renderSortIndicator}
                        resizeHandleClassName={resizeHandleClassName}
                        sortIndicatorClassName={sortIndicatorClassName}
                        attributes={cellAttributes}
                    />
                );
            })}
        </tr>
    );
};
