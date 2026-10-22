import * as React from 'react';

import {Grip as GripIcon} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {DraggableRowContext} from '../BaseDraggableRow';

import {b} from './DragHandle.classname';

import './DragHandle.scss';

export interface DragHandleProps<TData> {
    row: Row<TData>;
}

export const DragHandle = <TData,>(_props: DragHandleProps<TData>) => {
    const {attributes, listeners, setActivatorNodeRef} =
        React.useContext(DraggableRowContext) ?? {};

    return (
        <span
            {...attributes}
            {...listeners}
            ref={setActivatorNodeRef}
            className={b()}
            data-role="drag-handle"
        >
            <Icon data={GripIcon} size={16} />
        </span>
    );
};

DragHandle.displayName = 'DragHandle';
