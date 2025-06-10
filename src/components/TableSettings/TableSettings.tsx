import * as React from 'react';

import {DndContext, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {ChevronsDown, ChevronsRight, Gear} from '@gravity-ui/icons';
import {Button, Divider, Flex, Icon, Popup, Text, TextInput} from '@gravity-ui/uikit';
import type {PopupPlacement} from '@gravity-ui/uikit';
import type {Table, VisibilityState} from '@tanstack/react-table';
import {createColumn} from '@tanstack/react-table';
import debounce from 'lodash/debounce';

import type {Column, Header} from '../../types/base';
import {TableSettingsColumn} from '../TableSettingsColumn/TableSettingsColumn';
import {getColumnTitle} from '../TableSettingsColumn/TableSettingsColumn.utils';

import {b} from './TableSettings.classname';
import {
    getInitialOrderItems,
    getNestedColumnsCount,
    isDisplayedColumn,
    isFilteredColumn,
    orderStateToColumnOrder,
    useOrderedItems,
} from './TableSettings.utils';
import i18n from './i18n';

import './TableSettings.scss';

export interface TableSettingsOptions {
    sortable?: boolean;
    filterable?: boolean;
    enableSearch?: boolean;
    searchPlaceholder?: string;
}

export interface TableSettingsProps<TData> extends TableSettingsOptions {
    table: Table<TData>;
    onSettingsApply?: ({
        visibilityState,
        columnOrder,
    }: {
        visibilityState: VisibilityState;
        columnOrder: string[];
    }) => void;
}

const POPUP_PLACEMENT: PopupPlacement = ['bottom-end', 'bottom', 'top-end', 'top', 'left', 'right'];

const NESTED_COLUMNS_PREFIX = 'nested_columns_count_';

export const TableSettings = <TData extends unknown>({
    table,
    sortable = true,
    filterable = true,
    enableSearch = false,
    searchPlaceholder = '',
    onSettingsApply,
}: TableSettingsProps<TData>) => {
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState<boolean>(false);
    const [search, setSearch] = React.useState('');
    const [expandNestedColumns, setExpandNestedColumns] = React.useState(false);
    const allColumns = React.useMemo(table.getAllColumns, [table]);
    const filteredColumns = React.useMemo(() => allColumns.filter(isDisplayedColumn), [allColumns]);

    const headers = table.getFlatHeaders();
    const headersById = React.useMemo(() => {
        return headers.reduce<Record<string, Header<TData, unknown>>>((acc, header) => {
            const result = {...acc};
            result[header.column.id] = header;
            return result;
        }, {});
    }, [headers]);

    const {hiddenNodes, partiallyHiddenNodes} = React.useMemo(() => {
        const hiddenNodes = new Set();
        const partiallyHiddenNodes = new Set();
        const columnMatches = new Set();

        const checkColumnVisibility = (column: Column<TData>[], parentColumn?: Column<TData>) => {
            const visibleColumns = column.filter(function findColumn(
                column: Column<TData>,
            ): boolean {
                // column matches
                if (isFilteredColumn(getColumnTitle(column, headersById[column.id]), search)) {
                    columnMatches.add(column.id);
                    return true;
                }

                // nested column matches
                if (column.columns.findIndex((childColumn) => findColumn(childColumn)) !== -1) {
                    return true;
                }

                if (parentColumn) {
                    if (columnMatches.has(parentColumn.id)) {
                        partiallyHiddenNodes.add(parentColumn.id);
                    }
                    // show all columns in expanded view mode
                    if (expandNestedColumns && !hiddenNodes.has(parentColumn.id)) {
                        return true;
                    }
                }
                // remove column form list
                hiddenNodes.add(column.id);
                return false;
            });

            visibleColumns.forEach((column) => {
                checkColumnVisibility(column.columns, column);
            });
        };

        if (search.length > 0) {
            checkColumnVisibility(filteredColumns);
        }

        return {hiddenNodes, partiallyHiddenNodes};
    }, [filteredColumns, search, expandNestedColumns, headersById]);

    const [visibilityState, setVisibilityState] = React.useState(
        () => table.getState().columnVisibility,
    );
    const [orderState, setOrderState] = React.useState(() =>
        getInitialOrderItems(filteredColumns, table.getState().columnOrder),
    );

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const {orderedItems, activeDepth, handleDragEnd, handleDragStart, handleDragCancel} =
        useOrderedItems(filteredColumns, orderState, setOrderState);

    const orderedItemIds = React.useMemo(() => orderedItems.map(({id}) => id), [orderedItems]);

    const renderColumns = (renderedColumns: Column<TData>[], innerColumn?: Column<TData>) => {
        const columns = [...renderedColumns];
        const isSortableColumn = sortable && !search.length;
        const level = innerColumn?.depth ?? 0;

        const displayedColumns = columns.filter((column) => !hiddenNodes.has(column.id));

        if (innerColumn && !expandNestedColumns && partiallyHiddenNodes.has(innerColumn.id)) {
            let count = getNestedColumnsCount(innerColumn);
            if (displayedColumns.length) {
                count -= displayedColumns.length;
            }

            displayedColumns.push(
                createColumn(
                    table,
                    {
                        id: `${NESTED_COLUMNS_PREFIX}${innerColumn.id}`,
                        header: () => (
                            <Text variant="body-1" color="secondary">
                                {i18n('nested_columns_count', {
                                    count,
                                })}
                            </Text>
                        ),
                        columns: [],
                        enableHiding: false,
                    },
                    level + 1,
                    innerColumn,
                ),
            );
        }

        return displayedColumns.map((innerColumn) => {
            const children = innerColumn.columns.length
                ? renderColumns(innerColumn.columns.filter(isDisplayedColumn), innerColumn)
                : null;
            const header = headersById[innerColumn.id] ?? innerColumn.columnDef.header;
            const isFilterableColumn = innerColumn.id.startsWith(NESTED_COLUMNS_PREFIX)
                ? false
                : filterable;

            return (
                <TableSettingsColumn
                    key={innerColumn.id}
                    column={innerColumn}
                    header={header}
                    visibilityState={visibilityState}
                    sortable={isSortableColumn}
                    filterable={isFilterableColumn}
                    activeDepth={activeDepth}
                    withOffset
                    onVisibilityToggle={setVisibilityState}
                >
                    {children}
                </TableSettingsColumn>
            );
        });
    };

    const resetSettings = () => {
        setVisibilityState(table.getState().columnVisibility);
        setOrderState(getInitialOrderItems(filteredColumns, table.getState().columnOrder));
        setSearch('');
    };

    const cancelEditing = () => {
        setOpen(false);
        resetSettings();
    };

    const togglePopup = () => {
        if (open) cancelEditing();
        else setOpen(true);
    };

    const applyNewSettings = () => {
        const columnOrder = orderStateToColumnOrder(orderState);

        if (onSettingsApply) onSettingsApply({visibilityState, columnOrder});

        if (filterable) table.setColumnVisibility(visibilityState);
        if (sortable) table.setColumnOrder(columnOrder);

        setOpen(false);
        setSearch('');
    };

    const updateSearch = debounce((value: string) => {
        setSearch(value);
    }, 200);

    const toggleNestedColumns = () => setExpandNestedColumns(!expandNestedColumns);

    const emptyResult =
        search.length > 0 && !orderedItems.some((item) => !hiddenNodes.has(item.id));

    return (
        <React.Fragment>
            <Popup
                open={open}
                onClose={cancelEditing}
                anchorRef={anchorRef}
                placement={POPUP_PLACEMENT}
                className={b()}
                // @ts-ignore
                contentClassName={b()}
            >
                <div className={b('popover-content')}>
                    {enableSearch && (
                        <TextInput
                            placeholder={searchPlaceholder}
                            className={b('search-input')}
                            endContent={
                                partiallyHiddenNodes.size > 0 && (
                                    <Button view="flat-secondary" onClick={toggleNestedColumns}>
                                        {expandNestedColumns ? (
                                            <Flex alignItems="center">
                                                <Icon data={ChevronsDown} />
                                                {i18n('collapse_button')}
                                            </Flex>
                                        ) : (
                                            <Flex alignItems="center">
                                                <Icon data={ChevronsRight} />
                                                {i18n('expand_button')}
                                            </Flex>
                                        )}
                                    </Button>
                                )
                            }
                            onUpdate={updateSearch}
                        />
                    )}
                    {emptyResult ? (
                        <Text variant="body-1" color="secondary" className={b('empty-message')}>
                            {i18n('not_found')}
                        </Text>
                    ) : (
                        <DndContext
                            onDragEnd={handleDragEnd}
                            onDragStart={handleDragStart}
                            onDragCancel={handleDragCancel}
                            sensors={sensors}
                        >
                            <SortableContext
                                items={orderedItemIds}
                                strategy={verticalListSortingStrategy}
                            >
                                {renderColumns(orderedItems)}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
                <Divider />
                {!emptyResult && (
                    <div className={b('popover-actions')}>
                        <Button view="action" size="m" onClick={applyNewSettings} width="max">
                            {i18n('button_apply')}
                        </Button>
                    </div>
                )}
            </Popup>
            <Button view="flat-secondary" size="m" ref={anchorRef} onClick={togglePopup}>
                <Icon data={Gear} />
            </Button>
        </React.Fragment>
    );
};
