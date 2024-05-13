import React from 'react';

import type {SortableListProps} from '../SortableList';
import {SortableList} from '../SortableList';
import {SortableListDndContext} from '../SortableListDndContext';
import type {SortableListDndContextProps} from '../SortableListDndContext';
import type {TableProps} from '../Table';
import {flattenTableData} from '../utils/flattenTableData';

import './ReorderingProvider.scss';

export interface ReorderingProviderProps<TData>
    extends Pick<TableProps<TData>, 'data' | 'getRowId' | 'getSubRows' | 'expandedIds'> {
    children?: React.ReactNode;
    dndModifiers?: SortableListDndContextProps['modifiers'];
    enableNesting?: SortableListProps['nestingEnabled'];
    onReorder?: SortableListProps['onDragEnd'];
}

export const ReorderingProvider = <TData,>({
    children,
    data,
    dndModifiers,
    enableNesting,
    expandedIds,
    getRowId,
    getSubRows,
    onReorder,
}: ReorderingProviderProps<TData>) => {
    const rowIds = React.useMemo(
        () => flattenTableData({data, getRowId, getSubRows, expandedIds, transformItem: getRowId}),
        [data, getRowId, getSubRows, expandedIds],
    );

    return (
        <SortableListDndContext modifiers={dndModifiers}>
            <SortableList items={rowIds} onDragEnd={onReorder} nestingEnabled={enableNesting}>
                {children}
            </SortableList>
        </SortableListDndContext>
    );
};
