import * as React from 'react';

import type {
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';

import type {SortableListDragResult} from '../components';
import {REORDER_TYPE_ROW, fromRowSortableId, getReorderType} from '../components/TableDndRoot';
import type {TableDndScopeHandlers} from '../components/TableDndRoot';

import {useBodyCursorOverride} from './useBodyCursorOverride';

export interface UseSortableListParams {
    items: string[];
    onDragStart?: (activeId: string) => void;
    onDragEnd?: (result: SortableListDragResult) => void;
    enableNesting?: boolean;
    childModeOffset?: number;
    nextChildModeOffset?: number;
}

export const useSortableList = ({
    items,
    onDragStart,
    onDragEnd,
    enableNesting,
    childModeOffset = 20,
    nextChildModeOffset = 10,
}: UseSortableListParams) => {
    const [activeItemKey, setActiveItemKey] = React.useState<string | null>(null);
    const [targetItemIndex, setTargetItemIndex] = React.useState(-1);
    const [isParentMode, setIsParentMode] = React.useState(false);
    const [isChildMode, setIsChildMode] = React.useState(false);
    const [isNextChildMode, setIsNextChildMode] = React.useState(false);

    const isParentModeRef = React.useRef(isParentMode);
    const isChildModeRef = React.useRef(isChildMode);
    const isNextChildModeRef = React.useRef(isNextChildMode);
    const {restoreBodyCursor, setBodyCursor} = useBodyCursorOverride();

    const itemIndexMap = React.useMemo(() => {
        const map = new Map<string, number>();

        items.forEach((item, index) => {
            map.set(item, index);
        });

        return map;
    }, [items]);

    const getItemIndex = React.useCallback(
        (item?: string | null) => {
            if (typeof item !== 'undefined' && item !== null) {
                return itemIndexMap.get(item) ?? -1;
            }

            return -1;
        },
        [itemIndexMap],
    );

    const resetState = React.useCallback(() => {
        isParentModeRef.current = false;
        isChildModeRef.current = false;
        isNextChildModeRef.current = false;
        setActiveItemKey(null);
        setTargetItemIndex(-1);
        setIsParentMode(false);
        setIsChildMode(false);
        setIsNextChildMode(false);
    }, []);

    const getTargetItemKey = React.useCallback(
        (activeId: string, overId?: string) => {
            if (overId) {
                const overItemIndex = getItemIndex(overId);
                const activeItemIndex = getItemIndex(activeId);

                if (overItemIndex <= activeItemIndex) {
                    return items[overItemIndex - 1];
                }
            }

            return overId;
        },
        [getItemIndex, items],
    );

    const handlers = React.useMemo<TableDndScopeHandlers>(
        () => ({
            onDragStart: (event: DragStartEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_ROW) {
                    return;
                }

                const activeId = fromRowSortableId(event.active.id as string);

                setActiveItemKey(activeId);
                onDragStart?.(activeId);
                setBodyCursor('grabbing');
            },
            onDragMove: (event: DragMoveEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_ROW || !enableNesting) {
                    return;
                }

                const nextIsParentMode = event.delta.x < -childModeOffset;
                const nextIsChildMode = event.delta.x > childModeOffset;
                const nextIsNextChildMode =
                    event.delta.x > nextChildModeOffset && event.delta.x <= childModeOffset;

                isParentModeRef.current = nextIsParentMode;
                isChildModeRef.current = nextIsChildMode;
                isNextChildModeRef.current = nextIsNextChildMode;
                setIsParentMode(nextIsParentMode);
                setIsChildMode(nextIsChildMode);
                setIsNextChildMode(nextIsNextChildMode);
            },
            onDragOver: (event: DragOverEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_ROW) {
                    return;
                }

                const activeId = fromRowSortableId(event.active.id as string);
                const overId = event.over ? fromRowSortableId(event.over.id as string) : undefined;
                const targetItemKey = getTargetItemKey(activeId, overId);

                setTargetItemIndex(
                    targetItemKey && targetItemKey !== activeId ? getItemIndex(targetItemKey) : -1,
                );
            },
            onDragEnd: (event: DragEndEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_ROW) {
                    return;
                }

                restoreBodyCursor();

                if (!event.over) {
                    resetState();
                    return;
                }

                const draggedItemKey = fromRowSortableId(event.active.id as string);
                const targetItemKey = getTargetItemKey(
                    draggedItemKey,
                    fromRowSortableId(event.over.id as string),
                );

                if (targetItemKey === draggedItemKey) {
                    resetState();
                    return;
                }

                if (isChildModeRef.current) {
                    onDragEnd?.({
                        draggedItemKey,
                        targetItemKey,
                        enableNesting,
                    });
                } else {
                    onDragEnd?.({
                        draggedItemKey,
                        baseItemKey: targetItemKey,
                        baseNextItemKey: items[targetItemKey ? getItemIndex(targetItemKey) + 1 : 0],
                        enableNesting,
                        nextChild: isNextChildModeRef.current,
                        pullFromParent: isParentModeRef.current,
                    });
                }

                resetState();
            },
            onDragCancel: (_event: DragCancelEvent) => {
                restoreBodyCursor();
                resetState();
            },
        }),
        [
            childModeOffset,
            enableNesting,
            getItemIndex,
            getTargetItemKey,
            items,
            nextChildModeOffset,
            onDragEnd,
            onDragStart,
            resetState,
            restoreBodyCursor,
            setBodyCursor,
        ],
    );

    return {
        activeItemKey,
        activeItemIndex: getItemIndex(activeItemKey),
        targetItemIndex,
        isParentMode,
        isChildMode,
        isNextChildMode,
        handlers,
    };
};
