import * as React from 'react';

import {flexRender} from '@tanstack/react-table';

import type {Cell} from '../../types/base';
import {getCellClassModes, getCellStyles} from '../../utils';
import {b} from '../BaseTable/BaseTable.classname';

import {areMemoizedCellPropsEqual} from './utils/areMemoizedCellPropsEqual';

export interface BaseCellProps<TData>
    extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'className'> {
    cell?: Cell<TData, unknown>;
    className?: string | ((cell?: Cell<TData, unknown>) => string);
    attributes?:
        | React.TdHTMLAttributes<HTMLTableCellElement>
        | ((cell?: Cell<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>);
}

/** @internal */
export interface BaseCellImplementationProps<TData> extends BaseCellProps<TData> {
    deferContent?: boolean;
    memoizeContent?: boolean;
    renderVersion?: unknown;
}

const BaseCellComponent = <TData,>({
    cell,
    children,
    className: classNameProp,
    deferContent = false,
    memoizeContent: _memoizeContent,
    renderVersion: _renderVersion,
    style,
    attributes: attributesProp,
    ...restProps
}: BaseCellImplementationProps<TData>) => {
    const attributes = typeof attributesProp === 'function' ? attributesProp(cell) : attributesProp;
    const className = typeof classNameProp === 'function' ? classNameProp(cell) : classNameProp;
    let content = children;

    if (cell) {
        content = deferContent ? null : flexRender(cell.column.columnDef.cell, cell.getContext());
    }

    return (
        <td
            className={b('cell', getCellClassModes(cell), className)}
            {...restProps}
            {...attributes}
            data-virtualization-cell-content={deferContent ? 'deferred' : undefined}
            style={getCellStyles(cell, {...style, ...attributes?.style})}
        >
            {content}
        </td>
    );
};

export const BaseCell = BaseCellComponent as <TData>(
    props: BaseCellProps<TData>,
) => React.ReactElement;

/** @internal */
export const MemoizedBaseCell = React.memo(
    BaseCellComponent,
    areMemoizedCellPropsEqual,
) as typeof BaseCellComponent;
