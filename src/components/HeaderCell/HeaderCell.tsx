import React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {renderDefaultSortIndicator} from '../../utils';
import {b} from '../Table/Table.classname';

export interface HeaderCellProps<TData, TValue> {
    className?: string;
    contentClassName?: string;
    header: Header<TData, TValue>;
    parentHeader?: Header<TData, unknown>;
    renderSortIndicator?: (header: Header<TData, TValue>, className?: string) => React.ReactNode;
    sortIndicatorClassName?: string;
}

export const HeaderCell = <TData, TValue>({
    className,
    contentClassName,
    header,
    parentHeader,
    renderSortIndicator = renderDefaultSortIndicator,
    sortIndicatorClassName,
}: HeaderCellProps<TData, TValue>) => {
    const {table} = header.getContext();
    const {columnSizingInfo} = table.getState();
    const {columnResizeDirection, columnResizeMode, enableColumnResizing} = table.options;

    const columnRelativeDepth = header.depth - header.column.depth;

    if (!header.isPlaceholder && header.id === header.column.id && columnRelativeDepth > 1) {
        return null;
    }

    let rowSpan = 1;

    if (header.isPlaceholder) {
        if (parentHeader?.isPlaceholder && parentHeader.placeholderId === header.placeholderId) {
            return null;
        }

        const leafs = header.getLeafHeaders();
        rowSpan = leafs.length ?? 1;
    }

    return (
        <th
            className={b(
                'header-cell',
                {
                    id: header.column.id,
                    placeholder: header.isPlaceholder,
                    sortable: header.column.getCanSort(),
                    wide: header.colSpan > 1,
                },
                className,
            )}
            style={{
                width: header.getSize(),
                minWidth: header.column.columnDef.minSize,
                maxWidth: header.column.columnDef.maxSize,
            }}
            colSpan={header.colSpan}
            rowSpan={rowSpan}
            onClick={header.column.getToggleSortingHandler()}
        >
            <div className={b('header-cell-content', contentClassName)}>
                {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                {header.column.getCanSort() && renderSortIndicator(header, sortIndicatorClassName)}
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
        </th>
    );
};
