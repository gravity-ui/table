import React from 'react';

import type {Row as RowType, Table as TableType} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {DraggableRow} from '../DraggableRow';
import type {HeaderRowProps} from '../HeaderRow';
import {HeaderRow} from '../HeaderRow';
import {Row} from '../Row';
import type {RowProps} from '../Row';
import {SortableListContext} from '../SortableListContext';
import {TableContextProvider} from '../TableContextProvider';
import type {TableContextProviderProps} from '../TableContextProvider';

import {b} from './Table.classname';

import './Table.scss';

export interface TableProps<TData, TScrollElement extends Element | Window = HTMLDivElement> {
    bodyClassName?: string;
    cellClassName?: string;
    className?: string;
    enableNesting?: boolean;
    getGroupTitle?: RowProps<TData>['getGroupTitle'];
    getIsCustomRow?: RowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: RowProps<TData>['getIsGroupHeaderRow'];
    getRowAttributes?: RowProps<TData>['getRowAttributes'];
    groupHeaderClassName?: RowProps<TData>['groupHeaderClassName'];
    headerCellClassName?: string;
    headerClassName?: string;
    headerRowClassName?: string;
    onRowClick?: RowProps<TData>['onClick'];
    renderCustomRowContent?: RowProps<TData>['renderCustomRowContent'];
    renderGroupHeader?: RowProps<TData>['renderGroupHeader'];
    renderGroupHeaderRowContent?: RowProps<TData>['renderGroupHeaderRowContent'];
    renderResizeHandle?: HeaderRowProps<TData, unknown>['renderResizeHandle'];
    renderSortIndicator?: HeaderRowProps<TData, unknown>['renderSortIndicator'];
    resizeHandleClassName?: HeaderRowProps<TData, unknown>['resizeHandleClassName'];
    rowClassName?: string;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    sortIndicatorClassName?: HeaderRowProps<TData, unknown>['sortIndicatorClassName'];
    stickyHeader?: boolean;
    table: TableType<TData>;
    withHeader?: boolean;
}

export const Table = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            bodyClassName,
            cellClassName,
            className,
            enableNesting,
            getGroupTitle,
            getIsGroupHeaderRow,
            getRowAttributes,
            headerCellClassName,
            headerClassName,
            headerRowClassName,
            onRowClick,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            renderResizeHandle,
            renderSortIndicator,
            resizeHandleClassName,
            rowClassName,
            rowVirtualizer,
            sortIndicatorClassName,
            stickyHeader = false,
            table,
            withHeader = true,
        }: TableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const draggableContext = React.useContext(SortableListContext);
        const draggingRowIndex = draggableContext?.activeItemIndex ?? -1;

        const getRowByIndex = React.useCallback<TableContextProviderProps<TData>['getRowByIndex']>(
            (rowIndex: number) => {
                return table.getRowModel().rows[rowIndex];
            },
            [table],
        );

        const {rows} = table.getRowModel();

        const headerGroups = table.getHeaderGroups();

        return (
            <TableContextProvider getRowByIndex={getRowByIndex} enableNesting={enableNesting}>
                <table
                    ref={ref}
                    className={b({'with-row-virtualization': Boolean(rowVirtualizer)}, className)}
                    data-dragging-row-index={draggingRowIndex > -1 ? draggingRowIndex : undefined}
                >
                    {withHeader && (
                        <thead className={b('header', {sticky: stickyHeader}, headerClassName)}>
                            {headerGroups.map((headerGroup, index) => (
                                <HeaderRow
                                    key={headerGroup.id}
                                    cellClassName={headerCellClassName}
                                    className={headerRowClassName}
                                    headerGroup={headerGroup}
                                    parentHeaderGroup={headerGroups[index - 1]}
                                    renderResizeHandle={renderResizeHandle}
                                    renderSortIndicator={renderSortIndicator}
                                    resizeHandleClassName={resizeHandleClassName}
                                    sortIndicatorClassName={sortIndicatorClassName}
                                />
                            ))}
                        </thead>
                    )}
                    <tbody
                        className={b('body', bodyClassName)}
                        style={{
                            height: rowVirtualizer?.getTotalSize(),
                        }}
                    >
                        {(rowVirtualizer?.getVirtualItems() || rows).map((virtualItemOrRow) => {
                            const row = rowVirtualizer
                                ? rows[virtualItemOrRow.index]
                                : (virtualItemOrRow as RowType<TData>);

                            const rowProps: RowProps<TData, TScrollElement> = {
                                cellClassName,
                                className: rowClassName,
                                getGroupTitle,
                                getIsGroupHeaderRow,
                                getRowAttributes,
                                onClick: onRowClick,
                                renderGroupHeader,
                                renderGroupHeaderRowContent,
                                row,
                                rowVirtualizer,
                                virtualItem: rowVirtualizer
                                    ? (virtualItemOrRow as VirtualItem<HTMLTableRowElement>)
                                    : undefined,
                            };

                            if (draggableContext) {
                                return <DraggableRow key={row.id} {...rowProps} />;
                            }

                            return <Row key={row.id} {...rowProps} />;
                        })}
                    </tbody>
                </table>
            </TableContextProvider>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: TableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

Table.displayName = 'Table';
