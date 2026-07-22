import type {CollisionDetection} from '@dnd-kit/core';
import {closestCenter, rectIntersection} from '@dnd-kit/core';

import {REORDER_TYPE_COLUMN} from '../constants';

export function tableCollisionDetection(
    args: Parameters<CollisionDetection>[0],
): ReturnType<CollisionDetection> {
    const type = args.active.data.current?.reorderType;
    const containers = args.droppableContainers.filter(
        (container) => container.data.current?.reorderType === type,
    );
    const filteredArgs = {...args, droppableContainers: containers};

    return type === REORDER_TYPE_COLUMN
        ? closestCenter(filteredArgs)
        : rectIntersection(filteredArgs);
}
