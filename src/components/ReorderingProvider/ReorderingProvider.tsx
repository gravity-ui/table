import React from 'react';

import type {Table} from '@tanstack/react-table';

import type {SortableListProps} from '../SortableList';
import {SortableList} from '../SortableList';
import {SortableListDndContext} from '../SortableListDndContext';
import type {SortableListDndContextProps} from '../SortableListDndContext';

import './ReorderingProvider.scss';

export interface ReorderingProviderProps<TData> {
    table: Table<TData>;
    children?: React.ReactNode;
    dndModifiers?: SortableListDndContextProps['modifiers'];
    enableNesting?: SortableListProps['enableNesting'];
    onReorder?: SortableListProps['onDragEnd'];
}

export const ReorderingProvider = <TData,>({
    table,
    children,
    dndModifiers,
    enableNesting,
    onReorder,
}: ReorderingProviderProps<TData>) => {
    const {rows} = table.getRowModel();
    const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);

    return (
        <SortableListDndContext modifiers={dndModifiers}>
            <SortableList items={rowIds} onDragEnd={onReorder} enableNesting={enableNesting}>
                {children}
            </SortableList>
        </SortableListDndContext>
    );
};
