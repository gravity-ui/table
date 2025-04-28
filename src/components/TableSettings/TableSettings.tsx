import * as React from 'react';

import {DndContext, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Gear} from '@gravity-ui/icons';
import {Button, Divider, Icon, Popup, Text, TextInput} from '@gravity-ui/uikit';
import type {PopupPlacement} from '@gravity-ui/uikit';
import type {Table, VisibilityState} from '@tanstack/react-table';
import debounce from 'lodash/debounce';
import type {Column, Header} from '../../types/base';
import {TableSettingsColumn} from '../TableSettingsColumn/TableSettingsColumn';
import {getColumnTitle} from '../TableSettingsColumn/TableSettingsColumn.utils';

import {b} from './TableSettings.classname';
import {
    getInitialOrderItems,
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
    const allColumns = table.getAllColumns();
    const filteredColumns = React.useMemo(() => allColumns.filter(isDisplayedColumn), [allColumns]);
    const headers = table.getFlatHeaders();
    const headersById = React.useMemo(() => {
        return headers.reduce<Record<string, Header<TData, unknown>>>((acc, header) => {
            const result = {...acc};
            result[header.column.id] = header;
            return result;
        }, {});
    }, [headers]);

    const [visibilityState, setVisibilityState] = React.useState(
        () => table.getState().columnVisibility,
    );
    const [orderState, setOrderState] = React.useState(() =>
        getInitialOrderItems(filteredColumns, table.getState().columnOrder),
    );
    const [search, setSearch] = React.useState('');

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const {orderedItems, activeDepth, handleDragEnd, handleDragStart, handleDragCancel} =
        useOrderedItems(filteredColumns, orderState, setOrderState);

    const renderColumns = (renderedColumns: Column<TData>[], level = 0) => {
        let columns = renderedColumns;
        let isSortableColumn = sortable;
        const disabledColumns = new Set();

        if (enableSearch && search.length > 0) {
            isSortableColumn = false;
            columns = renderedColumns.filter(function findColumn(column: Column<TData>): boolean {
                if (isFilteredColumn(getColumnTitle(column, headersById[column.id]), search)) {
                    return true;
                }
                if (column.columns.length > 0) {
                    if (column.columns.findIndex((childColumn) => findColumn(childColumn)) !== -1) {
                        disabledColumns.add(column.id);
                        return true;
                    }
                }
                return false;
            });
        }

        if (!level && !columns.length) {
            return (
                <Text variant="body-1" color="secondary" className={b('empty-message')}>
                    {i18n('not_found')}
                </Text>
            );
        }

        return columns.map((innerColumn) => {
            const children = renderColumns(innerColumn.columns.filter(isDisplayedColumn), ++level);
            const header = headersById[innerColumn.id];
            const isDisabledColumn = disabledColumns.has(innerColumn.id);

            return (
                <TableSettingsColumn
                    key={innerColumn.id}
                    column={innerColumn}
                    header={header}
                    visibilityState={visibilityState}
                    sortable={isSortableColumn}
                    filterable={filterable && !isDisabledColumn}
                    disabled={isDisabledColumn}
                    activeDepth={activeDepth}
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
                            hasClear
                            onUpdate={updateSearch}
                        />
                    )}
                    <DndContext
                        onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                        onDragCancel={handleDragCancel}
                        sensors={sensors}
                    >
                        <SortableContext
                            items={orderedItems.map(({id}) => id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {renderColumns(orderedItems)}
                        </SortableContext>
                    </DndContext>
                </div>
                <Divider />
                <div className={b('popover-actions')}>
                    <Button view="action" size="m" onClick={applyNewSettings} width="max">
                        {i18n('button_apply')}
                    </Button>
                </div>
            </Popup>
            <Button view="flat-secondary" size="m" ref={anchorRef} onClick={togglePopup}>
                <Icon data={Gear} />
            </Button>
        </React.Fragment>
    );
};
