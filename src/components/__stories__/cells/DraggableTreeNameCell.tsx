import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import type {Row} from '@tanstack/react-table';

import {useDraggableRowDepth} from '../../../hooks';

import {TreeNameCell} from './TreeNameCell';

export interface DraggableTreeNameCellProps<TData> {
    row: Row<TData>;
    value: string;
}

export const DraggableTreeNameCell = <TData,>({row, value}: DraggableTreeNameCellProps<TData>) => {
    const {isDragging} = useSortable({
        id: row.id,
    });

    const {depth} = useDraggableRowDepth({row, isDragging});

    return <TreeNameCell row={row} depth={depth} value={value} />;
};
