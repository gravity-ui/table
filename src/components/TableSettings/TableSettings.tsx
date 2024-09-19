import React from 'react';

import {DndContext, MouseSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext} from '@dnd-kit/sortable';
import {Gear} from '@gravity-ui/icons';
import {Button, Divider, Icon, Popup} from '@gravity-ui/uikit';
import type {Column, Header, Table} from '@tanstack/react-table';

import {TableSettingsColumn} from '../TableSettingsColumn/TableSettingsColumn';

import {b} from './TableSettings.classname';
import {
    getInitialOrderItems,
    orderStateToColumnOrder,
    useOrderedItems,
} from './TableSettings.utils';
import i18n from './i18n';

import './TableSettings.scss';

interface Props<TData> {
    table: Table<TData>;
    column?: Column<TData, unknown>;
}

export const TableSettings = <TData extends unknown>({table, column}: Props<TData>) => {
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState<boolean>(false);
    const columns = table.getAllColumns();
    const filteredColumns = column
        ? columns.filter((otherColumn) => otherColumn.id !== column.id)
        : columns;
    const headers = table.getFlatHeaders();
    const headersById = headers.reduce(
        (acc, header) => {
            const result = {...acc};
            result[header.column.id] = header;
            return acc;
        },
        {} as Record<string, Header<TData, unknown>>,
    );

    const [visibilityState, setVisibilityState] = React.useState(table.getState().columnVisibility);
    const [orderState, setOrderState] = React.useState(getInitialOrderItems(filteredColumns));

    const renderColumns = (renderedColumns: Column<TData, unknown>[]) => {
        return renderedColumns.map((innerColumn, index) => {
            const children = renderColumns(innerColumn.columns);
            const header = headersById[innerColumn.id];
            const rootNode = innerColumn.depth === 0;
            const lastInGroup = index === renderedColumns.length - 1;

            return (
                <React.Fragment key={innerColumn.id}>
                    <TableSettingsColumn
                        key={innerColumn.id}
                        column={innerColumn}
                        header={header}
                        visibilityState={visibilityState}
                        onVisibilityToggle={setVisibilityState}
                    >
                        {children}
                    </TableSettingsColumn>
                    {rootNode && !lastInGroup ? (
                        <div className={b('divider')}>
                            <Divider />
                        </div>
                    ) : null}
                </React.Fragment>
            );
        });
    };

    const applyNewSettings = () => {
        table.setColumnVisibility(visibilityState);
        table.setColumnOrder(orderStateToColumnOrder(orderState));
        setOpen(false);
    };

    const sensors = useSensors(useSensor(MouseSensor));

    const {orderedItems, handleDragEnd} = useOrderedItems(
        filteredColumns,
        orderState,
        setOrderState,
    );

    return (
        <React.Fragment>
            <Popup open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
                <div className={b('popover-content')}>
                    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
                        <SortableContext items={orderedItems.map(({id}) => id)}>
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
