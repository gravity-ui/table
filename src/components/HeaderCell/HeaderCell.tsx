import React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {b} from '../Table/Table.classname';
import {renderDefaultSortIndicator} from '../utils/renderDefaultSortIndicator';

export interface HeaderCellProps<TData, TValue> {
    className?: string;
    contentClassName?: string;
    header: Header<TData, TValue>;
    renderSortIndicator?: (header: Header<TData, TValue>, className?: string) => React.ReactNode;
    selection?: boolean;
    sortIndicatorClassName?: string;
}

export const HeaderCell = <TData, TValue>({
    className,
    contentClassName,
    header,
    renderSortIndicator = renderDefaultSortIndicator,
    selection,
    sortIndicatorClassName,
}: HeaderCellProps<TData, TValue>) => {
    const {table} = header.getContext();
    const {columnSizingInfo} = table.getState();
    const {columnResizeDirection, columnResizeMode, enableColumnResizing} = table.options;

    return (
        <th
            className={b(
                'header-cell',
                {
                    id: header.column.id,
                    placeholder: header.isPlaceholder,
                    sortable: header.column.getCanSort(),
                },
                className,
            )}
            style={{
                width: header.getSize(),
                minWidth: header.column.columnDef.minSize,
                maxWidth: header.column.columnDef.maxSize,
            }}
            colSpan={header.colSpan}
            onClick={header.column.getToggleSortingHandler()}
        >
            {header.isPlaceholder ? null : (
                <div className={b('header-cell-content', {selection}, contentClassName)}>
                    {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                    {header.column.getCanSort() &&
                        renderSortIndicator(header, sortIndicatorClassName)}
                    {enableColumnResizing && (
                        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                        <div
                            className={b('resizer', {
                                direction: columnResizeDirection,
                                resizing: header.column.getIsResizing(),
                            })}
                            onDoubleClick={() => header.column.resetSize()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            style={{
                                transform:
                                    columnResizeMode === 'onEnd' && header.column.getIsResizing()
                                        ? `translateX(${
                                              (columnResizeDirection === 'rtl' ? -1 : 1) *
                                              (columnSizingInfo.deltaOffset ?? 0)
                                          }px)`
                                        : '',
                            }}
                        />
                    )}
                </div>
            )}
        </th>
    );
};
