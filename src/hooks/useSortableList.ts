import React from 'react';

import {useDndMonitor} from '@dnd-kit/core';
import type {DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent} from '@dnd-kit/core';

import type {SortableListDragResult} from '../components';

export interface UseSortableListParams {
    items: string[];
    onDragStart?: (activeId: string) => void;
    onDragEnd?: (result: SortableListDragResult) => void;
    nestingEnabled?: boolean;
    childModeOffset?: number;
    nextChildModeOffset?: number;
}

export const useSortableList = ({
    items,
    onDragStart,
    onDragEnd,
    nestingEnabled = true,
    childModeOffset = 20,
    nextChildModeOffset = 10,
}: UseSortableListParams) => {
    const [activeItemKey, setActiveItemKey] = React.useState<string | null>(null);
    const [targetItemIndex, setTargetItemIndex] = React.useState<number>(-1);
    const [isParentMode, setIsParentMode] = React.useState(false);
    const [isChildMode, setIsChildMode] = React.useState(false);
    const [isNextChildMode, setIsNextChildMode] = React.useState(false);

    const resetState = () => {
        setActiveItemKey(null);
        setTargetItemIndex(-1);
        setIsParentMode(false);
        setIsChildMode(false);
        setIsNextChildMode(false);
    };

    const getTargetItemKey = (activeItemKey: string, overItemKey?: string) => {
        if (overItemKey) {
            const isForward = items.indexOf(overItemKey) > items.indexOf(activeItemKey);

            if (!isForward) {
                const overItemIndex = items.indexOf(overItemKey);
                return items[overItemIndex - 1];
            }
        }

        return overItemKey;
    };

    useDndMonitor({
        onDragStart: ({active: {id: activeId}}: DragStartEvent) => {
            setActiveItemKey(activeId as string);
            onDragStart?.(activeId as string);

            document.body.style.setProperty('cursor', 'grabbing');
        },
        onDragMove: ({delta}: DragMoveEvent) => {
            if (nestingEnabled) {
                setIsParentMode(delta.x < -childModeOffset);
                setIsChildMode(delta.x > childModeOffset);
                setIsNextChildMode(delta.x > nextChildModeOffset && delta.x <= childModeOffset);
            }
        },
        onDragOver: ({active, over}: DragOverEvent) => {
            const activeItemKey = active.id;

            const targetItemKey = getTargetItemKey(activeItemKey as string, over?.id as string);

            const targetItemIndex =
                targetItemKey && targetItemKey !== activeItemKey
                    ? items.indexOf(targetItemKey)
                    : -1;

            setTargetItemIndex(targetItemIndex);
        },
        onDragEnd: ({active, over}: DragEndEvent) => {
            document.body.style.setProperty('cursor', 'default');

            if (!over) {
                resetState();
                return;
            }

            const draggedItemKey = active.id as string;
            const targetItemKey = getTargetItemKey(draggedItemKey, over.id as string);

            if (targetItemKey === draggedItemKey) {
                resetState();
                return;
            }

            if (isChildMode) {
                onDragEnd?.({
                    draggedItemKey,
                    targetItemKey,
                    nestingEnabled,
                });
            } else {
                const targetItemIndex = targetItemKey ? items.indexOf(targetItemKey) : -1;

                onDragEnd?.({
                    draggedItemKey,
                    baseItemKey: targetItemKey,
                    baseNextItemKey: items[targetItemIndex + 1],
                    nestingEnabled,
                    nextChild: isNextChildMode,
                    pullFromParent: isParentMode,
                });
            }

            resetState();
        },
        onDragCancel: resetState,
    });

    return {
        activeItemKey,
        targetItemIndex,
        isParentMode,
        isChildMode,
        isNextChildMode,
    };
};
