import * as React from 'react';

import type {Table} from '@tanstack/react-table';

import type {SortableListProps} from '../SortableList';
import {SortableList} from '../SortableList';
import type {SortableListDndContextProps} from '../SortableListDndContext';

import './ReorderingProvider.scss';

export interface ReorderingProviderProps<TData> {
    /** The table instance returned from the `useTable` hook */
    table: Table<TData>;
    /** Children */
    children?: React.ReactNode;
    /** Enables dragging a row by any part of it instead of requiring a drag handle. Default: `false` */
    dragWithoutHandle?: SortableListProps['dragWithoutHandle'];
    /** A list of the dnd-kit modifiers */
    dndModifiers?: SortableListDndContextProps['modifiers'];
    /** Determines whether elements can be nested using drag-and-drop */
    enableNesting?: SortableListProps['enableNesting'];
    /** Reorder handler triggered when the dnd-kit's `onDragEnd` event fires */
    onReorder?: SortableListProps['onDragEnd'];
}

export const ReorderingProvider = <TData,>({
    table,
    children,
    dragWithoutHandle = false,
    dndModifiers,
    enableNesting,
    onReorder,
}: ReorderingProviderProps<TData>) => {
    const {rows} = table.getRowModel();
    const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);

    return (
        <SortableList
            items={rowIds}
            onDragEnd={onReorder}
            enableNesting={enableNesting}
            dragWithoutHandle={dragWithoutHandle}
            dndModifiers={dndModifiers}
        >
            {children}
        </SortableList>
    );
};
