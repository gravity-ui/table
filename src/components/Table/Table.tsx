import React from 'react';

import type {
    Cell as CellProperties,
    ColumnDef,
    ColumnResizeDirection,
    ColumnResizeMode,
    ColumnSizingInfoState,
    ColumnSizingState,
    GroupingOptions,
    GroupingState,
    OnChangeFn,
    Row as RowProperties,
    SortingState,
    TableOptions,
} from '@tanstack/react-table';
import {
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {defaultDragHandleColumn, defaultSelectionColumn} from '../../constants';
import type {UseColumnsParams, UseExpandedParams, UseSelectionParams} from '../../hooks';
import {useColumns, useExpanded, useSelection} from '../../hooks';
import {Cell} from '../Cell';
import type {HeaderRowProps} from '../HeaderRow';
import {HeaderRow} from '../HeaderRow';
import type {RowProps} from '../Row';
import {Row} from '../Row';
import {SortableListContext} from '../SortableListContext';
import {TableContextProvider} from '../TableContextProvider';
import type {TableContextProviderProps} from '../TableContextProvider';
import {VirtualizationContext} from '../VirtualizationContext';

import {b} from './Table.classname';

import './Table.scss';

export interface TableProps<TData>
    extends UseSelectionParams,
        UseExpandedParams,
        Pick<
            Partial<RowProps<TData>>,
            'checkIsGroupRow' | 'renderGroupHeader' | 'getGroupTitle' | 'getRowDataAttributes'
        >,
        Pick<
            Partial<HeaderRowProps<TData, unknown>>,
            'sortIndicatorClassName' | 'renderSortIndicator'
        > {
    className?: string;
    rowClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string;
    headerCellContentClassName?: string;
    cellClassName?: string;
    cellContentClassName?: string;
    withHeader?: boolean;
    data: TData[];
    getRowId: (item: TData) => string;
    columns: ColumnDef<TData>[];
    selectionColumn?: UseColumnsParams<TData>['selectionColumn'];
    dragHandleColumn?: UseColumnsParams<TData>['dragHandleColumn'];
    getSubRows?: (item: TData) => undefined | TData[];
    onRowClick?: RowProps<TData>['onClick'];
    enableNesting?: boolean;
    enableSorting?: boolean;
    manualSorting?: boolean;
    sorting?: SortingState;
    onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
    grouping?: GroupingState;
    enableGrouping?: boolean;
    groupedColumnMode?: GroupingOptions['groupedColumnMode'];
    manualGrouping?: boolean;
    onGroupingChange?: GroupingOptions['onGroupingChange'];
    aggregationFns?: GroupingOptions['aggregationFns'];
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;
    columnResizeDirection?: ColumnResizeDirection;
    onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
    onColumnSizingInfoChange?: OnChangeFn<ColumnSizingInfoState>;
}

export const Table = React.memo(
    <TData,>({
        className,
        rowClassName,
        headerRowClassName,
        headerClassName,
        bodyClassName,
        headerCellClassName,
        headerCellContentClassName,
        cellClassName,
        cellContentClassName,
        getRowId,
        columns: providedColumns,
        withHeader = true,
        data,
        selectedIds,
        onSelectedChange,
        selectionColumn = defaultSelectionColumn as ColumnDef<TData>,
        dragHandleColumn = defaultDragHandleColumn as ColumnDef<TData>,
        expandedIds,
        onExpandedChange,
        getSubRows,
        getGroupTitle,
        checkIsGroupRow,
        renderGroupHeader,
        onRowClick,
        getRowDataAttributes,
        enableNesting,
        enableSorting = false,
        manualSorting,
        sorting,
        onSortingChange,
        sortIndicatorClassName,
        renderSortIndicator,
        grouping,
        enableGrouping,
        groupedColumnMode,
        manualGrouping,
        onGroupingChange,
        aggregationFns,
        enableColumnResizing = false,
        columnResizeMode = 'onChange',
        columnResizeDirection = 'ltr',
        onColumnSizingChange,
        onColumnSizingInfoChange,
    }: TableProps<TData>) => {
        const draggable = Boolean(React.useContext(SortableListContext));

        const virtualizationContext = React.useContext(VirtualizationContext);
        const virtual = Boolean(virtualizationContext);
        const {totalSize, virtualItems} = virtualizationContext ?? {};

        const {
            enableRowSelection,
            enableMultiRowSelection,
            rowSelection,
            handleRowSelectionChange,
        } = useSelection<TData>({
            selectedIds,
            onSelectedChange,
        });

        const {expanded, getExpandedRowModel, handleExpandedChange, enableExpanding} =
            useExpanded<TData>({
                expandedIds,
                onExpandedChange,
            });

        const columns: ColumnDef<TData>[] = useColumns({
            columns: providedColumns,
            enableRowSelection,
            selectionColumn,
            dragHandleColumn,
            draggable,
        });

        const tableOptions: TableOptions<TData> = {
            getRowId,
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            state: {
                rowSelection,
                expanded,
                sorting,
                grouping,
            },

            // selection
            enableRowSelection,
            enableMultiRowSelection,
            onRowSelectionChange: handleRowSelectionChange,

            // expanding
            enableExpanding,
            getSubRows,
            getRowCanExpand: (row) => Boolean(checkIsGroupRow?.(row) || row.subRows?.length),
            getExpandedRowModel,
            onExpandedChange: handleExpandedChange,

            // sorting
            enableSorting,
            manualSorting,
            getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
            onSortingChange,

            // grouping
            enableGrouping,
            getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
            groupedColumnMode,
            manualGrouping,
            onGroupingChange,
            aggregationFns,

            // resizing
            enableColumnResizing,
            columnResizeMode,
            columnResizeDirection,
        };

        if (onColumnSizingChange) {
            tableOptions.onColumnSizingChange = onColumnSizingChange;
        }

        if (onColumnSizingInfoChange) {
            tableOptions.onColumnSizingInfoChange = onColumnSizingInfoChange;
        }

        const table = useReactTable(tableOptions);

        const getRowByIndex = React.useCallback<TableContextProviderProps<TData>['getRowByIndex']>(
            (rowIndex: number) => {
                return table.getRowModel().rows[rowIndex];
            },
            [table],
        );

        const renderCell = React.useCallback(
            (cell: CellProperties<TData, unknown>) => {
                return (
                    <Cell
                        cell={cell}
                        selectionColumnId={selectionColumn?.id}
                        className={cellClassName}
                        contentClassName={cellContentClassName}
                    />
                );
            },
            [cellClassName, cellContentClassName, selectionColumn?.id],
        );

        const renderRow = (
            row: RowProperties<TData>,
            additionalProps?: Partial<RowProps<TData>>,
        ) => (
            <Row
                key={row.id}
                row={row}
                checkIsGroupRow={checkIsGroupRow}
                onClick={onRowClick}
                className={rowClassName}
                renderCell={renderCell}
                cellClassName={cellClassName}
                renderGroupHeader={renderGroupHeader}
                getGroupTitle={getGroupTitle}
                columnsCount={providedColumns.length}
                getRowDataAttributes={getRowDataAttributes}
                draggable={draggable}
                {...additionalProps}
            />
        );

        const {rows} = table.getRowModel();

        const headerGroups = table.getHeaderGroups();

        return (
            <TableContextProvider
                getRowByIndex={getRowByIndex}
                enableNesting={enableNesting}
                getTableState={table.getState}
            >
                <table className={b(null, className)}>
                    {withHeader && (
                        <thead className={b('header', headerClassName)}>
                            {headerGroups.map((headerGroup, index) => (
                                <HeaderRow
                                    key={headerGroup.id}
                                    headerGroup={headerGroup}
                                    parentHeaderGroup={headerGroups[index - 1]}
                                    className={headerRowClassName}
                                    cellClassName={headerCellClassName}
                                    cellContentClassName={headerCellContentClassName}
                                    selectionColumnId={selectionColumn?.id}
                                    sortIndicatorClassName={sortIndicatorClassName}
                                    renderSortIndicator={renderSortIndicator}
                                />
                            ))}
                        </thead>
                    )}
                    <tbody
                        className={bodyClassName}
                        style={{
                            height: totalSize,
                        }}
                    >
                        {!virtual && rows.map((row) => renderRow(row))}
                        {virtual &&
                            virtualItems?.map((virtualRow) => {
                                const tableRow = rows[virtualRow.index] as RowProperties<TData>;

                                return renderRow(tableRow, {
                                    virtualRow,
                                });
                            })}
                    </tbody>
                </table>
            </TableContextProvider>
        );
    },
) as (<TData>(
    props: TableProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

Table.displayName = 'Table';
