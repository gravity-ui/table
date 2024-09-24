import React from 'react';

import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Grip} from '@gravity-ui/icons';
import {Checkbox, Divider, Icon, Text} from '@gravity-ui/uikit';
import type {Column, Header, Updater, VisibilityState} from '@tanstack/react-table';

import type {TableSettingsOptions} from '../TableSettings/TableSettings';

import {b} from './TableSettingsColumn.classname';
import {getIsVisible, isEnabledHidding} from './TableSettingsColumn.utils';

import './TableSettingsColumn.scss';

interface Props<TData> extends TableSettingsOptions {
    column: Column<TData, unknown>;
    header: Header<TData, unknown>;
    visibilityState: VisibilityState;
    showDivider: boolean;
    onVisibilityToggle: (updater: Updater<VisibilityState>) => void;
}

export const TableSettingsColumn = <TData extends unknown>({
    column,
    header,
    children,
    visibilityState,
    showDivider,
    filterable,
    sortable,
    onVisibilityToggle,
}: React.PropsWithChildren<Props<TData>>) => {
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

    const isParent = innerColumns.length > 1;

    const toggle = () => {
        if (isParent) {
            const newState = innerColumns.reduce(
                (acc, innerColumn) => {
                    const result = {...acc};
                    if (isEnabledHidding(innerColumn)) result[innerColumn.id] = !isVisible;
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

    if (transform) transform.scaleY = 1;
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div style={style} ref={setNodeRef}>
            <div
                key={column.id}
                className={b({'with-divider': showDivider && !isDragging})}
                {...attributes}
                ref={setNodeRef}
                data-role="drag-handle"
            >
                <div className={b('content')}>
                    {sortable ? (
                        <span className={b('drag-handle', {dragging: isDragging})} {...listeners}>
                            <Icon data={Grip} size={16} />
                        </span>
                    ) : null}
                    {filterable ? (
                        <Checkbox
                            checked={isVisible}
                            disabled={!isEnabledHidding(column)}
                            onChange={toggle}
                            indeterminate={isIndeterminate}
                        />
                    ) : null}
                    {renderSpacers()}
                    <Text variant="body-1" className={b('name', {parent: isParent})}>
                        {columnHeader}
                    </Text>
                </div>

                <SortableContext
                    id={column.id}
                    items={column.columns?.map(({id}) => id)}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>
            </div>
            {showDivider && !isDragging ? (
                <div className={b('divider')}>
                    <Divider />
                </div>
            ) : null}
        </div>
    );
};
