import React from 'react';

import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';

import type {UseSortableListParams} from '../../hooks';
import {useSortableList} from '../../hooks';
import {SortableListContext} from '../SortableListContext';

export interface SortableListProps extends UseSortableListParams {
    children?: React.ReactNode;
}

export const SortableList = ({
    children,
    items,
    onDragStart,
    onDragEnd,
    nestingEnabled,
}: SortableListProps) => {
    const {
        activeItemKey,
        activeItemIndex,
        isChildMode,
        isParentMode,
        isNextChildMode,
        targetItemIndex,
    } = useSortableList({
        items,
        onDragStart,
        onDragEnd,
        nestingEnabled,
    });

    const contextValue = React.useMemo(
        () => ({
            activeItemKey,
            activeItemIndex,
            isChildMode,
            isNextChildMode,
            isParentMode,
            targetItemIndex,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeItemKey, isChildMode, isNextChildMode, isParentMode, targetItemIndex],
    );

    return (
        <SortableListContext.Provider value={contextValue}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </SortableListContext.Provider>
    );
};
