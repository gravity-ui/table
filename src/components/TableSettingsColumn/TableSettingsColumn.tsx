import * as React from 'react';

import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {Grip} from '@gravity-ui/icons';
import {Checkbox, Divider, Icon, Text} from '@gravity-ui/uikit';
import type {Updater, VisibilityState} from '@tanstack/react-table';

import type {Column, ColumnDef, Header} from '../../types/base';
import type {TableSettingsOptions} from '../TableSettings/TableSettings';

import {b} from './TableSettingsColumn.classname';
import {getIsVisible, isEnabledHiding} from './TableSettingsColumn.utils';

import './TableSettingsColumn.scss';

interface Props<TData> extends TableSettingsOptions {
    column: Column<TData>;
    header: Header<TData, unknown>;
    visibilityState: VisibilityState;
    activeDepth?: number;
    onVisibilityToggle: (updater: Updater<VisibilityState>) => void;
}

export const TableSettingsColumn = <TData extends unknown>({
    column,
    header,
    children,
    visibilityState,
    filterable,
    sortable,
    activeDepth,
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

    const renderColumn = (columnDef: ColumnDef<TData, unknown>) => {
        if (columnDef.meta?.titleInSettings) {
            const titleInSettings = columnDef.meta?.titleInSettings;
            return typeof titleInSettings === 'function'
                ? titleInSettings(column)
                : titleInSettings;
        }

        const columnHeader = columnDef.header;
        return typeof columnHeader === 'function' ? columnHeader(context) : columnHeader;
    };

    const isParent = innerColumns.length > 1;

    const toggle = () => {
        if (isParent) {
            const newState = innerColumns.reduce<Record<string, boolean>>((acc, innerColumn) => {
                const result = {...acc};
                if (isEnabledHiding(innerColumn))
                    result[innerColumn.id] = !(isVisible && !isIndeterminate);
                return result;
            }, {});
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

    const isDisabledContext =
        typeof activeDepth === 'number' ? activeDepth !== column.depth : false;
    const isRoot = column.depth === 0;

    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: column.id,
        disabled: {
            draggable: isDisabledContext,
            droppable: isDisabledContext,
        },
    });

    const style = {
        transform: `translate3d(0px, ${transform?.y ?? 0}px, 0)`,
        transition,
    };

    return (
        <div
            style={style}
            ref={setNodeRef}
            className={b({dragging: isDragging, root: isRoot, sortable})}
        >
            <div className={b('background')}>
                <div
                    {...attributes}
                    {...(sortable ? {...listeners} : {})}
                    className={b('layout', {dragging: isDragging})}
                >
                    <div className={b('content')}>
                        {filterable ? (
                            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                            <div
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <Checkbox
                                    checked={isVisible}
                                    disabled={!isEnabledHiding(column)}
                                    onChange={toggle}
                                    indeterminate={isIndeterminate}
                                    className={b('checkbox', {'unset-coursor': isDragging})}
                                />
                            </div>
                        ) : null}
                        {renderSpacers()}
                        <Text variant="body-1" className={b('name', {parent: isParent})}>
                            {renderColumn(column.columnDef)}
                        </Text>
                        {sortable ? (
                            <span className={b('drag-handle', {'unset-coursor': isDragging})}>
                                <Icon data={Grip} size={16} />
                            </span>
                        ) : null}
                    </div>

                    <SortableContext
                        id={column.id}
                        items={column.columns?.map(({id}) => id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {children}
                    </SortableContext>
                </div>
            </div>
            {isRoot && !isDragging ? (
                <div className={b('divider')}>
                    <Divider />
                </div>
            ) : null}
        </div>
    );
};
