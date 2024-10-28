import React from 'react';

import type {Row, Table} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {
    getAriaMultiselectable,
    getAriaRowIndexMap,
    getCellClassModes,
    shouldRenderFooterRow,
} from '../../utils';
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
    /** The table instance returned from the `useTable` hook */
    table: Table<TData>;
    /** HTML attributes for the `<table>` element */
    attributes?: React.TableHTMLAttributes<HTMLTableElement>;
    /** HTML attributes for the `<tbody>` element */
    bodyAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    /** CSS classes for the `<tbody>` element */
    bodyClassName?: string;
    /** Ref for the `<tbody>` element */
    bodyRef?: React.Ref<HTMLTableSectionElement>;
    /** HTML attributes for the `<td>` elements inside `<tbody>` */
    cellAttributes?: BaseRowProps<TData>['cellAttributes'];
    /** CSS classes for the `<td>` elements inside `<tbody>` */
    cellClassName?: BaseRowProps<TData>['cellClassName'];
    /** CSS classes for the `<table>` element */
    className?: string;
    /** Content displayed when the table has no data rows */
    emptyContent?: React.ReactNode | (() => React.ReactNode);
    /** HTML attributes for the `<tfoot>` element */
    footerAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    /** HTML attributes for the `<th>` elements inside `<tfoot>` */
    footerCellAttributes?: BaseFooterRowProps<TData>['cellAttributes'];
    /** CSS classes for the `<th>` elements inside `<tfoot>` */
    footerCellClassName?: BaseFooterRowProps<TData>['cellClassName'];
    /** CSS classes for the `<tfoot>` element */
    footerClassName?: string;
    /** HTML attributes for the `<tr>` elements inside `<tfoot>` */
    footerRowAttributes?: BaseFooterRowProps<TData>['attributes'];
    /** CSS classes for the `<tr>` elements inside `<tfoot>` */
    footerRowClassName?: BaseFooterRowProps<TData>['className'];
    /** Returns the title for a group header row */
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    /** Checks if the row is custom and should be rendered using `renderCustomRowContent` */
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    /** Checks if the row should be rendered as a group header */
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    /** CSS classes for the group header elements */
    groupHeaderClassName?: BaseRowProps<TData>['groupHeaderClassName'];
    /** HTML attributes for the `<thead>` element */
    headerAttributes?: React.HTMLAttributes<HTMLTableSectionElement>;
    /** HTML attributes for the `<th>` elements inside `<thead>` */
    headerCellAttributes?: BaseHeaderRowProps<TData>['cellAttributes'];
    /** CSS classes for the `<th>` elements inside `<thead>` */
    headerCellClassName?: BaseHeaderRowProps<TData>['cellClassName'];
    /** CSS classes for the `<thead>` element */
    headerClassName?: string;
    /** HTML attributes for the `<tr>` elements inside `<thead>` */
    headerRowAttributes?: BaseHeaderRowProps<TData>['attributes'];
    /** CSS classes for the `<tr>` elements inside `<thead>` */
    headerRowClassName?: BaseHeaderRowProps<TData>['className'];
    /** Click handler for rows inside `<tbody>` */
    onRowClick?: BaseRowProps<TData>['onClick'];
    /** Function to render custom rows */
    renderCustomRowContent?: BaseRowProps<TData>['renderCustomRowContent'];
    /** Function to override the default rendering of group headers */
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    /** Function to override the default rendering of the entire group header row */
    renderGroupHeaderRowContent?: BaseRowProps<TData>['renderGroupHeaderRowContent'];
    /** Function to override the default rendering of header cell content */
    renderHeaderCellContent?: BaseHeaderRowProps<TData>['renderHeaderCellContent'];
    /** Function to override the default rendering of resize handles */
    renderResizeHandle?: BaseHeaderRowProps<TData>['renderResizeHandle'];
    /** Function to override the default rendering of sort indicators */
    renderSortIndicator?: BaseHeaderRowProps<TData>['renderSortIndicator'];
    /** CSS classes for resize handles in `<th>` elements */
    resizeHandleClassName?: BaseHeaderRowProps<TData>['resizeHandleClassName'];
    /** HTML attributes for `<tr>` elements inside `<tbody>` */
    rowAttributes?: BaseRowProps<TData>['attributes'];
    /** CSS classes for `<tr>` elements inside `<tbody>` */
    rowClassName?: BaseRowProps<TData>['className'];
    /** The row virtualizer instance returned from `useRowVirtualizer` or `useWindowRowVirtualizer` hooks */
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    /** CSS classes for the sort indicator inside `<th>` elements */
    sortIndicatorClassName?: BaseHeaderRowProps<TData>['sortIndicatorClassName'];
    /** Makes the `<tfoot>` element sticky */
    stickyFooter?: boolean;
    /** Makes the `<thead>` element sticky */
    stickyHeader?: boolean;
    /** Determines whether the `<tfoot>` element should be rendered */
    withFooter?: boolean;
    /** Determines whether the `<thead>` element should be rendered */
    withHeader?: boolean;
}

export const BaseTable = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            table,
            attributes,
            bodyAttributes,
            bodyClassName,
            bodyRef,
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
            getIsCustomRow,
            getIsGroupHeaderRow,
            groupHeaderClassName,
            headerAttributes,
            headerCellAttributes,
            headerCellClassName,
            headerClassName,
            headerRowAttributes,
            headerRowClassName,
            onRowClick,
            renderCustomRowContent,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            renderHeaderCellContent,
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

        const {rows, rowsById} = table.getRowModel();

        const ariaRowIndexMap = React.useMemo(() => {
            return getAriaRowIndexMap(rows);
        }, [rows]);

        const headerGroups = withHeader && table.getHeaderGroups();
        const footerGroups = withFooter && table.getFooterGroups();

        const colCount = table.getVisibleLeafColumns().length;
        const headerRowCount = headerGroups ? headerGroups.length : 0;
        const bodyRowCount = Object.keys(rowsById).length;
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

                const virtualItem = rowVirtualizer ? (virtualItemOrRow as VirtualItem) : undefined;
                const key = virtualItem?.key ?? row.id;

                const rowProps: BaseRowProps<TData, TScrollElement> = {
                    cellClassName,
                    className: rowClassName,
                    getGroupTitle,
                    getIsCustomRow,
                    getIsGroupHeaderRow,
                    groupHeaderClassName,
                    attributes: rowAttributes,
                    cellAttributes,
                    onClick: onRowClick,
                    renderCustomRowContent,
                    renderGroupHeader,
                    renderGroupHeaderRowContent,
                    row,
                    rowVirtualizer,
                    table,
                    virtualItem,
                    'aria-rowindex': headerRowCount + ariaRowIndexMap[row.id],
                    'aria-selected': table.options.enableRowSelection
                        ? row.getIsSelected()
                        : undefined,
                };

                if (draggableContext) {
                    return <BaseDraggableRow key={key} {...rowProps} />;
                }

                return <BaseRow key={key} {...rowProps} />;
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
                                renderHeaderCellContent={renderHeaderCellContent}
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
                    ref={bodyRef}
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
