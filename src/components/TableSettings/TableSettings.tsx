import React from 'react';

import {DndContext, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Gear} from '@gravity-ui/icons';
import {Button, Divider, Icon, Popup} from '@gravity-ui/uikit';
import type {PopperPlacement} from '@gravity-ui/uikit/build/esm/hooks/private';
import type {Column, Header, Table, VisibilityState} from '@tanstack/react-table';

import {TableSettingsColumn} from '../TableSettingsColumn/TableSettingsColumn';

import {b} from './TableSettings.classname';
import {
    getInitialOrderItems,
    orderStateToColumnOrder,
    useOrderedItems,
} from './TableSettings.utils';
import i18n from './i18n';

import './TableSettings.scss';

export interface TableSettingsOptions {
    sortable?: boolean;
    filterable?: boolean;
}

export interface TableSettingsProps<TData> extends TableSettingsOptions {
    table: Table<TData>;
    columnId?: string;
    onSettingsApply?: ({
        visibilityState,
        columnOrder,
    }: {
        visibilityState: VisibilityState;
        columnOrder: string[];
    }) => void;
}

const POPUP_PLACEMENT: PopperPlacement = ['bottom-end', 'bottom', 'top-end', 'top', 'auto'];

export const TableSettings = <TData extends unknown>({
    table,
    sortable = true,
    filterable = true,
    columnId,
    onSettingsApply,
}: TableSettingsProps<TData>) => {
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState<boolean>(false);
    const columns = table.getAllColumns();
    const filteredColumns = React.useMemo(
        () => (columnId ? columns.filter((otherColumn) => otherColumn.id !== columnId) : columns),
        [columnId, columns],
    );
    const headers = table.getFlatHeaders();
    const headersById = React.useMemo(() => {
        return headers.reduce<Record<string, Header<TData, unknown>>>((acc, header) => {
            const result = {...acc};
            result[header.column.id] = header;
            return acc;
        }, {});
    }, [headers]);

    const [visibilityState, setVisibilityState] = React.useState(
        () => table.getState().columnVisibility,
    );
    const [orderState, setOrderState] = React.useState(() => getInitialOrderItems(filteredColumns));

    const applyNewSettings = () => {
        const columnOrder = orderStateToColumnOrder(orderState);

        if (onSettingsApply) onSettingsApply({visibilityState, columnOrder});

        if (filterable) table.setColumnVisibility(visibilityState);
        if (sortable) table.setColumnOrder(columnOrder);

        setOpen(false);
    };

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const {orderedItems, activeDepth, handleDragEnd, handleDragStart, handleDragCancel} =
        useOrderedItems(filteredColumns, orderState, setOrderState);

    const renderColumns = (renderedColumns: Column<TData>[]) => {
        return renderedColumns.map((innerColumn) => {
            const children = renderColumns(innerColumn.columns);
            const header = headersById[innerColumn.id];

            return (
                <TableSettingsColumn
                    key={innerColumn.id}
                    column={innerColumn}
                    header={header}
                    visibilityState={visibilityState}
                    sortable={sortable}
                    filterable={filterable}
                    activeDepth={activeDepth}
                    onVisibilityToggle={setVisibilityState}
                >
                    {children}
                </TableSettingsColumn>
            );
        });
    };

    return (
        <React.Fragment>
            <Popup
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={anchorRef}
                placement={POPUP_PLACEMENT}
                contentClassName={b()}
            >
                <div className={b('popover-content')}>
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
            <Button view="flat-secondary" size="m" ref={anchorRef} onClick={() => setOpen(!open)}>
                <Icon data={Gear} />
            </Button>
        </React.Fragment>
    );
};
