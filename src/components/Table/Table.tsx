import React from 'react';

import type {
    Cell as CellProperties,
    Row as RowProperties,
    Table as TableType,
} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow';
import {Cell} from '../Cell';
import {DraggableRow} from '../DraggableRow';
import type {HeaderRowProps} from '../HeaderRow';
import {HeaderRow} from '../HeaderRow';
import {SortableListContext} from '../SortableListContext';
import {TableContextProvider} from '../TableContextProvider';
import type {TableContextProviderProps} from '../TableContextProvider';

import {b} from './Table.classname';

import './Table.scss';

export interface TableProps<TData, TScrollElement extends Element | Window = HTMLDivElement> {
    bodyClassName?: string;
    cellClassName?: string;
    checkIsGroupRow?: BaseRowProps<TData>['checkIsGroupRow'];
    className?: string;
    enableNesting?: boolean;
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    getRowAttributes?: BaseRowProps<TData>['getRowAttributes'];
    headerCellClassName?: string;
    headerClassName?: string;
    headerRowClassName?: string;
    onRowClick?: BaseRowProps<TData>['onClick'];
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    renderSortIndicator?: HeaderRowProps<TData, unknown>['renderSortIndicator'];
    rowClassName?: string;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    sortIndicatorClassName?: HeaderRowProps<TData, unknown>['sortIndicatorClassName'];
    table: TableType<TData>;
    withHeader?: boolean;
}

export const Table = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            bodyClassName,
            cellClassName,
            checkIsGroupRow,
            className,
            enableNesting,
            getGroupTitle,
            getRowAttributes,
            headerCellClassName,
            headerClassName,
            headerRowClassName,
            onRowClick,
            renderGroupHeader,
            renderSortIndicator,
            rowClassName,
            rowVirtualizer,
            sortIndicatorClassName,
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

        const renderCell = React.useCallback(
            (cell: CellProperties<TData, unknown>) => {
                return <Cell cell={cell} className={cellClassName} />;
            },
            [cellClassName],
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
                        <thead className={b('header', headerClassName)}>
                            {headerGroups.map((headerGroup, index) => (
                                <HeaderRow
                                    key={headerGroup.id}
                                    headerGroup={headerGroup}
                                    parentHeaderGroup={headerGroups[index - 1]}
                                    className={headerRowClassName}
                                    cellClassName={headerCellClassName}
                                    sortIndicatorClassName={sortIndicatorClassName}
                                    renderSortIndicator={renderSortIndicator}
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
                                : (virtualItemOrRow as RowProperties<TData>);

                            const baseRowProps: BaseRowProps<TData, TScrollElement> = {
                                cellClassName,
                                checkIsGroupRow,
                                className: rowClassName,
                                columnsCount: table.options.columns.length,
                                getGroupTitle,
                                getRowAttributes,
                                onClick: onRowClick,
                                renderCell,
                                renderGroupHeader,
                                row,
                                rowVirtualizer,
                                virtualItem: rowVirtualizer
                                    ? (virtualItemOrRow as VirtualItem<HTMLTableRowElement>)
                                    : undefined,
                            };

                            if (draggableContext) {
                                return <DraggableRow key={row.id} {...baseRowProps} />;
                            }

                            return <BaseRow key={row.id} {...baseRowProps} />;
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
