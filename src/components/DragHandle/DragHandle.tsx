import {useSortable} from '@dnd-kit/sortable';
import {Grip as GripIcon} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {REORDER_TYPE_ROW, toRowSortableId} from '../TableDndRoot';

import {b} from './DragHandle.classname';

import './DragHandle.scss';

export interface DragHandleProps<TData> {
    row: Row<TData>;
}

export const DragHandle = <TData,>({row}: DragHandleProps<TData>) => {
    const {attributes, listeners} = useSortable({
        id: toRowSortableId(row.id),
        data: {reorderType: REORDER_TYPE_ROW},
    });

    return (
        <span {...attributes} {...listeners} className={b()} data-role="drag-handle">
            <Icon data={GripIcon} size={16} />
        </span>
    );
};

DragHandle.displayName = 'DragHandle';
