import React from 'react';

import type {Row as RowType, Table as TableType} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {BaseDraggableRow} from '../BaseDraggableRow';
import {BaseFooterRow} from '../BaseFooterRow';
import type {BaseHeaderRowProps} from '../BaseHeaderRow';
import {BaseHeaderRow} from '../BaseHeaderRow';
import {BaseRow} from '../BaseRow';
import type {BaseRowProps} from '../BaseRow';
import {SortableListContext} from '../SortableListContext';
import {TableContextProvider} from '../TableContextProvider';
import type {TableContextProviderProps} from '../TableContextProvider';

import {b} from './BaseTable.classname';

import './BaseTable.scss';

export interface BaseTableProps<TData, TScrollElement extends Element | Window = HTMLDivElement> {
    bodyClassName?: string;
    cellClassName?: BaseRowProps<TData>['cellClassName'];
    className?: string;
    enableNesting?: boolean;
    footerCellClassName?: string;
    footerClassName?: string;
    footerRowClassName?: string;
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    groupHeaderClassName?: BaseRowProps<TData>['groupHeaderClassName'];
    headerCellClassName?: BaseHeaderRowProps<TData, unknown>['cellClassName'];
    headerClassName?: string;
    headerRowClassName?: BaseHeaderRowProps<TData, unknown>['className'];
    onRowClick?: BaseRowProps<TData>['onClick'];
    renderCustomRowContent?: BaseRowProps<TData>['renderCustomRowContent'];
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    renderGroupHeaderRowContent?: BaseRowProps<TData>['renderGroupHeaderRowContent'];
    renderResizeHandle?: BaseHeaderRowProps<TData, unknown>['renderResizeHandle'];
    renderSortIndicator?: BaseHeaderRowProps<TData, unknown>['renderSortIndicator'];
    resizeHandleClassName?: BaseHeaderRowProps<TData, unknown>['resizeHandleClassName'];
    rowClassName?: BaseRowProps<TData>['className'];
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    sortIndicatorClassName?: BaseHeaderRowProps<TData, unknown>['sortIndicatorClassName'];
    stickyFooter?: boolean;
    stickyHeader?: boolean;
    table: TableType<TData>;
    withFooter?: boolean;
    withHeader?: boolean;
    attributes?: React.TableHTMLAttributes<HTMLTableElement>;
    headerAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    headerRowAttributes?: BaseHeaderRowProps<TData, unknown>['attributes'];
    headerCellAttributes?: BaseHeaderRowProps<TData, unknown>['cellAttributes'];
    bodyAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    rowAttributes?: BaseRowProps<TData>['attributes'];
    cellAttributes?: BaseRowProps<TData>['cellAttributes'];
}

export const BaseTable = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            bodyClassName,
            cellClassName,
            className,
            enableNesting,
            footerCellClassName,
            footerClassName,
            footerRowClassName,
            getGroupTitle,
            getIsGroupHeaderRow,
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
            stickyFooter,
            stickyHeader,
            table,
            withFooter,
            withHeader = true,
            attributes,
            headerAttributes,
            headerRowAttributes,
            headerCellAttributes,
            bodyAttributes,
            rowAttributes,
            cellAttributes,
        }: BaseTableProps<TData, TScrollElement>,
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

        const headerGroups = withHeader && table.getHeaderGroups();
        const footerGroups = withFooter && table.getFooterGroups();

        const colCount = table.getVisibleLeafColumns().length;
        const headerRowCount = headerGroups ? headerGroups.length : 0;
        const bodyRowCount = rows.length;
        const footerRowCount = footerGroups ? footerGroups.length : 0;
        const rowCount = bodyRowCount + headerRowCount + footerRowCount;

        return (
            <TableContextProvider getRowByIndex={getRowByIndex} enableNesting={enableNesting}>
                <table
                    ref={ref}
                    className={b({'with-row-virtualization': Boolean(rowVirtualizer)}, className)}
                    data-dragging-row-index={draggingRowIndex > -1 ? draggingRowIndex : undefined}
                    aria-colcount={colCount > 0 ? colCount : undefined}
                    aria-rowcount={rowCount > 0 ? rowCount : undefined}
                    {...attributes}
                >
                    {headerGroups && (
                        <thead
                            className={b('header', {sticky: stickyHeader}, headerClassName)}
                            {...headerAttributes}
                        >
                            {headerGroups.map((headerGroup, index) => (
                                <BaseHeaderRow
                                    key={headerGroup.id}
                                    cellClassName={headerCellClassName}
                                    className={headerRowClassName}
                                    headerGroup={headerGroup}
                                    parentHeaderGroup={headerGroups[index - 1]}
                                    renderResizeHandle={renderResizeHandle}
                                    renderSortIndicator={renderSortIndicator}
                                    resizeHandleClassName={resizeHandleClassName}
                                    sortIndicatorClassName={sortIndicatorClassName}
                                    attributes={headerRowAttributes}
                                    cellAttributes={headerCellAttributes}
                                    aria-rowindex={index + 1}
                                />
                            ))}
                        </thead>
                    )}
                    <tbody
                        className={b('body', bodyClassName)}
                        style={{
                            height: rowVirtualizer?.getTotalSize(),
                        }}
                        {...bodyAttributes}
                    >
                        {(rowVirtualizer?.getVirtualItems() || rows).map((virtualItemOrRow) => {
                            const row = rowVirtualizer
                                ? rows[virtualItemOrRow.index]
                                : (virtualItemOrRow as RowType<TData>);

                            const rowProps: BaseRowProps<TData, TScrollElement> = {
                                cellClassName,
                                className: rowClassName,
                                getGroupTitle,
                                getIsGroupHeaderRow,
                                attributes: rowAttributes,
                                cellAttributes,
                                onClick: onRowClick,
                                renderGroupHeader,
                                renderGroupHeaderRowContent,
                                row,
                                rowVirtualizer,
                                virtualItem: rowVirtualizer
                                    ? (virtualItemOrRow as VirtualItem<HTMLTableRowElement>)
                                    : undefined,
                                'aria-rowindex': headerRowCount + row.index + 1,
                            };

                            if (draggableContext) {
                                return <BaseDraggableRow key={row.id} {...rowProps} />;
                            }

                            return <BaseRow key={row.id} {...rowProps} />;
                        })}
                    </tbody>
                    {footerGroups && (
                        <tfoot className={b('footer', {sticky: stickyFooter}, footerClassName)}>
                            {footerGroups.map((footerGroup, index) => (
                                <BaseFooterRow
                                    key={footerGroup.id}
                                    cellClassName={footerCellClassName}
                                    className={footerRowClassName}
                                    footerGroup={footerGroup}
                                    aria-rowindex={headerRowCount + bodyRowCount + index + 1}
                                />
                            ))}
                        </tfoot>
                    )}
                </table>
            </TableContextProvider>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseTableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

BaseTable.displayName = 'BaseTable';
