import React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {getAriaSort, getCellStyles, getHeaderCellClassModes} from '../../utils';
import type {ResizeHandleProps} from '../ResizeHandle';
import {ResizeHandle} from '../ResizeHandle';
import type {SortIndicatorProps} from '../SortIndicator';
import {SortIndicator} from '../SortIndicator';
import {b} from '../Table/Table.classname';

export interface HeaderCellProps<TData, TValue> {
    className?:
        | string
        | ((header: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => string);
    header: Header<TData, TValue>;
    parentHeader?: Header<TData, unknown>;
    renderResizeHandle?: (props: ResizeHandleProps<TData, TValue>) => React.ReactNode;
    renderSortIndicator?: (props: SortIndicatorProps<TData, TValue>) => React.ReactNode;
    resizeHandleClassName?: string;
    sortIndicatorClassName?: string;
}

export const HeaderCell = <TData, TValue>({
    className: classNameProp,
    header,
    parentHeader,
    renderResizeHandle,
    renderSortIndicator,
    resizeHandleClassName,
    sortIndicatorClassName,
}: HeaderCellProps<TData, TValue>) => {
    const className = React.useMemo(() => {
        return typeof classNameProp === 'function'
            ? classNameProp(header, parentHeader)
            : classNameProp;
    }, [classNameProp, header, parentHeader]);

    const isPlaceholderRowSpannedCell =
        header.isPlaceholder &&
        parentHeader?.isPlaceholder &&
        parentHeader.placeholderId === header.placeholderId;

    const isLeafRowSpannedCell =
        !header.isPlaceholder &&
        header.id === header.column.id &&
        header.depth - header.column.depth > 1;

    if (isPlaceholderRowSpannedCell || isLeafRowSpannedCell) {
        return null;
    }

    const rowSpan = header.isPlaceholder ? header.getLeafHeaders().length : 1;

    return (
        <th
            className={b('header-cell', getHeaderCellClassModes(header), className)}
            colSpan={header.colSpan > 1 ? header.colSpan : undefined}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            onClick={header.column.getToggleSortingHandler()}
            style={getCellStyles(header)}
            aria-sort={getAriaSort(header.column.getIsSorted())}
        >
            {flexRender(header.column.columnDef.header, header.getContext())}{' '}
            {header.column.getCanSort() &&
                (renderSortIndicator ? (
                    renderSortIndicator({
                        className: b('sort-indicator', sortIndicatorClassName),
                        header,
                    })
                ) : (
                    <SortIndicator
                        className={b('sort-indicator', sortIndicatorClassName)}
                        header={header}
                    />
                ))}
            {header.column.getCanResize() &&
                (renderResizeHandle ? (
                    renderResizeHandle({
                        className: b('resize-handle', resizeHandleClassName),
                        header,
                    })
                ) : (
                    <ResizeHandle
                        className={b('resize-handle', resizeHandleClassName)}
                        header={header}
                    />
                ))}
        </th>
    );
};
