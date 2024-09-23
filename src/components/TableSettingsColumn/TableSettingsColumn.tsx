import React from 'react';

import {SortableContext, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Grip} from '@gravity-ui/icons';
import {Checkbox, Icon} from '@gravity-ui/uikit';
import type {Column, Header, Updater, VisibilityState} from '@tanstack/react-table';

import {b} from './TableSettingsColumn.classname';
import {getIsVisible} from './TableSettingsColumn.utils';

import './TableSettingsColumn.scss';

export const TableSettingsColumn = <TData extends unknown>({
    column,
    header,
    children,
    visibilityState,
    onVisibilityToggle,
}: React.PropsWithChildren<{
    column: Column<TData, unknown>;
    header: Header<TData, unknown>;
    visibilityState: VisibilityState;
    onVisibilityToggle: (updater: Updater<VisibilityState>) => void;
}>) => {
    const innerColumns = column.getLeafColumns();
    const isVisible = React.useMemo(
        () => innerColumns.some((innerColumn) => getIsVisible(innerColumn, visibilityState)),
        [innerColumns, visibilityState],
    );

    const isIndeterminate = React.useMemo(
        () =>
            isVisible &&
            innerColumns.some((innerColumn) => !getIsVisible(innerColumn, visibilityState)),
        [isVisible, innerColumns, visibilityState],
    );

    const context = header?.getContext();
    const columnHeader =
        typeof column.columnDef.header === 'function'
            ? column.columnDef.header(context)
            : column.columnDef.header;

    const toggle = () => {
        if (innerColumns.length > 1) {
            const newState = innerColumns.reduce(
                (acc, innerColumn) => {
                    const result = {...acc};
                    result[innerColumn.id] = !isVisible;
                    return result;
                },
                {} as Record<string, boolean>,
            );
            onVisibilityToggle((prevState) => ({...prevState, ...newState}));
        } else {
            onVisibilityToggle((prevState) => ({...prevState, [column.id]: !isVisible}));
        }
    };

    const renderSpacers = () => {
        const spacers = [];
        for (let index = 0; index < column.depth; index++) {
            spacers.push(<div key={index} className={b('vertical-spacer')} />);
        }
        return spacers;
    };

    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: column.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            key={column.id}
            className={b()}
            style={style}
            {...attributes}
            ref={setNodeRef}
            data-role="drag-handle"
        >
            <div className={b('content')}>
                <span className={b('drag-handle', {dragging: isDragging})} {...listeners}>
                    <Icon data={Grip} size={16} />
                </span>
                <Checkbox checked={isVisible} onChange={toggle} indeterminate={isIndeterminate} />
                {renderSpacers()}
                {columnHeader}
            </div>

            <SortableContext id={column.id} items={column.columns?.map(({id}) => id)}>
                {children}
            </SortableContext>
        </div>
    );
};
