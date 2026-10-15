import type {KeyboardCoordinateGetter, UniqueIdentifier} from '@dnd-kit/core';
import {KeyboardCode} from '@dnd-kit/core';
import {hasSortableData} from '@dnd-kit/sortable';

import {REORDER_TYPE_ROW} from '../constants';

import {getReorderType} from './reorderType';

export function getRowKeyboardTarget(
    event: KeyboardEvent,
    args: Parameters<KeyboardCoordinateGetter>[1],
    targetId?: UniqueIdentifier,
) {
    const {active, collisionRect, droppableContainers, droppableRects} = args.context;

    if (!hasSortableData(active) || !collisionRect || getReorderType(active) !== REORDER_TYPE_ROW) {
        return undefined;
    }

    const currentId = targetId ?? active.id;

    if (event.code === KeyboardCode.Left || event.code === KeyboardCode.Right) {
        return {
            id: currentId,
            coordinates: {
                ...args.currentCoordinates,
                x: args.currentCoordinates.x + (event.code === KeyboardCode.Left ? -25 : 25),
            },
        };
    }

    if (event.code !== KeyboardCode.Up && event.code !== KeyboardCode.Down) {
        return undefined;
    }

    // Prevent native page scrolling even when the first or last row has already been reached.
    event.preventDefault();
    const {items} = active.data.current.sortable;
    const currentIndex = items.indexOf(currentId);
    const activeIndex = items.indexOf(active.id);
    const nextIndex = currentIndex + (event.code === KeyboardCode.Down ? 1 : -1);
    const nextId = items[nextIndex];

    if (currentIndex < 0 || activeIndex < 0 || nextId === undefined) {
        return undefined;
    }

    const container = droppableContainers.get(nextId);
    const rect = droppableRects.get(nextId);

    if (!container || container.disabled || !container.node.current || !rect) {
        return undefined;
    }

    return {
        id: nextId,
        coordinates: {
            x: args.currentCoordinates.x,
            // Downward moves align the bottom edges; upward moves align the top edges.
            y: rect.top + (nextIndex > activeIndex ? rect.height - collisionRect.height : 0),
        },
    };
}
