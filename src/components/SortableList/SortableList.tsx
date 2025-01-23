import * as React from 'react';

import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';

import type {UseSortableListParams} from '../../hooks';
import {useSortableList} from '../../hooks';
import type {SortableListContextValue} from '../SortableListContext';
import {SortableListContext} from '../SortableListContext';

export interface SortableListProps extends UseSortableListParams {
    children?: React.ReactNode;
}

export const SortableList = ({
    children,
    items,
    onDragStart,
    onDragEnd,
    enableNesting,
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
        enableNesting,
    });

    const contextValue = React.useMemo(
        () =>
            ({
                activeItemKey,
                activeItemIndex,
                isChildMode,
                isNextChildMode,
                isParentMode,
                targetItemIndex,
                enableNesting,
                useSortable,
            }) satisfies SortableListContextValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeItemKey, isChildMode, isNextChildMode, isParentMode, targetItemIndex, enableNesting],
    );

    return (
        <SortableListContext.Provider value={contextValue}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </SortableListContext.Provider>
    );
};
