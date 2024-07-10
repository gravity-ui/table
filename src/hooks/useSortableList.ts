import React from 'react';

import {useDndMonitor} from '@dnd-kit/core';

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
    nestingEnabled,
    childModeOffset = 20,
    nextChildModeOffset = 10,
}: UseSortableListParams) => {
    const [activeItemKey, setActiveItemKey] = React.useState<string | null>(null);
    const [targetItemIndex, setTargetItemIndex] = React.useState(-1);
    const [isParentMode, setIsParentMode] = React.useState(false);
    const [isChildMode, setIsChildMode] = React.useState(false);
    const [isNextChildMode, setIsNextChildMode] = React.useState(false);

    const itemIndexMap = React.useMemo(() => {
        const map = new Map<string, number>();

        items.forEach((item, index) => {
            map.set(item, index);
        });

        return map;
    }, [items]);

    const getItemIndex = (item?: string | null) => {
        if (typeof item !== 'undefined' && item !== null) {
            return itemIndexMap.get(item) ?? -1;
        }

        return -1;
    };

    const resetState = () => {
        setActiveItemKey(null);
        setTargetItemIndex(-1);
        setIsParentMode(false);
        setIsChildMode(false);
        setIsNextChildMode(false);
    };

    const getTargetItemKey = (activeId: string, overId?: string) => {
        if (overId) {
            const overItemIndex = getItemIndex(overId);
            const activeItemIndex = getItemIndex(activeId);

            if (overItemIndex <= activeItemIndex) {
                return items[overItemIndex - 1];
            }
        }

        return overId;
    };

    useDndMonitor({
        onDragStart: (event) => {
            setActiveItemKey(event.active.id as string);
            onDragStart?.(event.active.id as string);

            document.body.style.setProperty('cursor', 'grabbing');
        },
        onDragMove: (event) => {
            if (nestingEnabled) {
                setIsParentMode(event.delta.x < -childModeOffset);
                setIsChildMode(event.delta.x > childModeOffset);

                setIsNextChildMode(
                    event.delta.x > nextChildModeOffset && event.delta.x <= childModeOffset,
                );
            }
        },
        onDragOver: (event) => {
            const targetItemKey = getTargetItemKey(
                event.active.id as string,
                event.over?.id as string,
            );

            setTargetItemIndex(
                targetItemKey && targetItemKey !== event.active.id
                    ? getItemIndex(targetItemKey)
                    : -1,
            );
        },
        onDragEnd: (event) => {
            document.body.style.setProperty('cursor', 'default');

            if (!event.over) {
                resetState();
                return;
            }

            const draggedItemKey = event.active.id as string;
            const targetItemKey = getTargetItemKey(draggedItemKey, event.over.id as string);

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
                onDragEnd?.({
                    draggedItemKey,
                    baseItemKey: targetItemKey,
                    baseNextItemKey: items[targetItemKey ? getItemIndex(targetItemKey) + 1 : 0],
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
        activeItemIndex: getItemIndex(activeItemKey),
        targetItemIndex,
        isParentMode,
        isChildMode,
        isNextChildMode,
    };
};
