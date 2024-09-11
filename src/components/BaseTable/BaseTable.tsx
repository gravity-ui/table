import React from 'react';

import type {Row, Table} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {getAriaMultiselectable, getCellClassModes, shouldRenderFooterRow} from '../../utils';
import {BaseDraggableRow} from '../BaseDraggableRow';
import type {BaseFooterRowProps} from '../BaseFooterRow';
import {BaseFooterRow} from '../BaseFooterRow';
import type {BaseHeaderRowProps} from '../BaseHeaderRow';
import {BaseHeaderRow} from '../BaseHeaderRow';
import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow';
import {SortableListContext} from '../SortableListContext';

import {b} from './BaseTable.classname';

import './BaseTable.scss';

export interface BaseTableProps<TData, TScrollElement extends Element | Window = HTMLDivElement> {
    table: Table<TData>;
    attributes?: React.TableHTMLAttributes<HTMLTableElement>;
    bodyAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    bodyClassName?: string;
    cellAttributes?: BaseRowProps<TData>['cellAttributes'];
    cellClassName?: BaseRowProps<TData>['cellClassName'];
    className?: string;
    emptyContent?: React.ReactNode | (() => React.ReactNode);
    footerAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    footerCellAttributes?: BaseFooterRowProps<TData>['cellAttributes'];
    footerCellClassName?: BaseFooterRowProps<TData>['cellClassName'];
    footerClassName?: string;
    footerRowAttributes?: BaseFooterRowProps<TData>['attributes'];
    footerRowClassName?: BaseFooterRowProps<TData>['className'];
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    groupHeaderClassName?: BaseRowProps<TData>['groupHeaderClassName'];
    headerAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    headerCellAttributes?: BaseHeaderRowProps<TData>['cellAttributes'];
    headerCellClassName?: BaseHeaderRowProps<TData>['cellClassName'];
    headerClassName?: string;
    headerRowAttributes?: BaseHeaderRowProps<TData>['attributes'];
    headerRowClassName?: BaseHeaderRowProps<TData>['className'];
    onRowClick?: BaseRowProps<TData>['onClick'];
    renderCustomRowContent?: BaseRowProps<TData>['renderCustomRowContent'];
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    renderGroupHeaderRowContent?: BaseRowProps<TData>['renderGroupHeaderRowContent'];
    renderResizeHandle?: BaseHeaderRowProps<TData>['renderResizeHandle'];
    renderSortIndicator?: BaseHeaderRowProps<TData>['renderSortIndicator'];
    resizeHandleClassName?: BaseHeaderRowProps<TData>['resizeHandleClassName'];
    rowAttributes?: BaseRowProps<TData>['attributes'];
    rowClassName?: BaseRowProps<TData>['className'];
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    sortIndicatorClassName?: BaseHeaderRowProps<TData>['sortIndicatorClassName'];
    stickyFooter?: boolean;
    stickyHeader?: boolean;
    withFooter?: boolean;
    withHeader?: boolean;
}

export const BaseTable = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            table,
            attributes,
            bodyAttributes,
            bodyClassName,
            cellAttributes,
            cellClassName,
            className,
            emptyContent,
            footerAttributes,
            footerCellAttributes,
            footerCellClassName,
            footerClassName,
            footerRowAttributes,
            footerRowClassName,
            getGroupTitle,
            getIsGroupHeaderRow,
            headerAttributes,
            headerCellAttributes,
            headerCellClassName,
            headerClassName,
            headerRowAttributes,
            headerRowClassName,
            onRowClick,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            renderResizeHandle,
            renderSortIndicator,
            resizeHandleClassName,
            rowAttributes,
            rowClassName,
            rowVirtualizer,
            sortIndicatorClassName,
            stickyFooter = false,
            stickyHeader = false,
            withFooter = false,
            withHeader = true,
        }: BaseTableProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableElement>,
    ) => {
        const draggableContext = React.useContext(SortableListContext);
        const draggingRowIndex = draggableContext?.activeItemIndex ?? -1;

        const {rows} = table.getRowModel();

        const headerGroups = withHeader && table.getHeaderGroups();
        const footerGroups = withFooter && table.getFooterGroups();

        const colCount = table.getVisibleLeafColumns().length;
        const headerRowCount = headerGroups ? headerGroups.length : 0;
        const bodyRowCount = rows.length;
        const footerRowCount = footerGroups ? footerGroups.length : 0;
        const rowCount = bodyRowCount + headerRowCount + footerRowCount;

        const renderBodyRows = () => {
            const bodyRows = rowVirtualizer?.getVirtualItems() || rows;

            if (bodyRows.length === 0) {
                const emptyRowClassName =
                    typeof rowClassName === 'function' ? rowClassName() : rowClassName;

                const emptyCellClassName =
                    typeof cellClassName === 'function' ? cellClassName() : cellClassName;

                return (
                    <tr className={b('row', {}, emptyRowClassName)}>
                        <td
                            className={b('cell', getCellClassModes(), emptyCellClassName)}
                            colSpan={colCount}
                        >
                            {typeof emptyContent === 'function' ? emptyContent() : emptyContent}
                        </td>
                    </tr>
                );
            }

            return bodyRows.map((virtualItemOrRow) => {
                const row = rowVirtualizer
                    ? rows[virtualItemOrRow.index]
                    : (virtualItemOrRow as Row<TData>);

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
                    table,
                    virtualItem: rowVirtualizer ? (virtualItemOrRow as VirtualItem) : undefined,
                    'aria-rowindex': headerRowCount + row.index + 1,
                    'aria-selected': table.options.enableRowSelection
                        ? row.getIsSelected()
                        : undefined,
                };

                if (draggableContext) {
                    return <BaseDraggableRow key={row.id} {...rowProps} />;
                }

                return <BaseRow key={row.id} {...rowProps} />;
            });
        };

        return (
            <table
                ref={ref}
                className={b({'with-row-virtualization': Boolean(rowVirtualizer)}, className)}
                data-dragging-row-index={draggingRowIndex > -1 ? draggingRowIndex : undefined}
                aria-colcount={colCount > 0 ? colCount : undefined}
                aria-rowcount={rowCount > 0 ? rowCount : undefined}
                aria-multiselectable={getAriaMultiselectable(table)}
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
                    {...bodyAttributes}
                    style={{
                        height: rowVirtualizer?.getTotalSize(),
                        ...bodyAttributes?.style,
                    }}
                >
                    {renderBodyRows()}
                </tbody>
                {footerGroups && (
                    <tfoot
                        className={b('footer', {sticky: stickyFooter}, footerClassName)}
                        {...footerAttributes}
                    >
                        {footerGroups.map((footerGroup, index) =>
                            shouldRenderFooterRow(footerGroup) ? (
                                <BaseFooterRow
                                    key={footerGroup.id}
                                    footerGroup={footerGroup}
                                    attributes={footerRowAttributes}
                                    cellAttributes={footerCellAttributes}
                                    cellClassName={footerCellClassName}
                                    className={footerRowClassName}
                                    aria-rowindex={headerRowCount + bodyRowCount + index + 1}
                                />
                            ) : null,
                        )}
                    </tfoot>
                )}
            </table>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseTableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
) => React.ReactElement) & {displayName: string};

BaseTable.displayName = 'BaseTable';
