import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import type {Row, Table} from '@tanstack/react-table';

import {useDraggableRowDepth} from '../../hooks';
import {BaseDraggableRowMarker} from '../BaseDraggableRowMarker';
import {SortableListContext} from '../SortableListContext';

import {b} from './BaseDragHandle.classname';

import './BaseDragHandle.scss';

export interface BaseDragHandleProps<TData> {
    row: Row<TData>;
    table: Table<TData>;
}

export const BaseDragHandle = <TData,>({row, table}: BaseDragHandleProps<TData>) => {
    const {attributes, listeners, isDragging} = useSortable({
        id: row.id,
    });

    const {enableNesting} = React.useContext(SortableListContext) || {};

    const {depth} = useDraggableRowDepth({row, table, isDragging});

    return (
        <React.Fragment>
            <span {...attributes} {...listeners} className={b()} data-role="drag-handle">
                <svg viewBox="0 0 6 10" width="6" height="10">
                    <path
                        fill="currentColor"
                        d="M0 0h2v2H0zm0 4h2v2H0zm0 4h2v2H0zm4-8h2v2H4zm0 4h2v2H4zm0 4h2v2H4z"
                    />
                </svg>
            </span>
            {isDragging && enableNesting && <BaseDraggableRowMarker left={depth * 28 ?? 0} />}
        </React.Fragment>
    );
};

BaseDragHandle.displayName = 'BaseDragHandle';
