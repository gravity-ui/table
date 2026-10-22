import type {CollisionDetection} from '@dnd-kit/core';
import {rectIntersection} from '@dnd-kit/core';

import {REORDER_TYPE_COLUMN} from '../constants';

import {closestLeadingColumnEdge} from './closestLeadingColumnEdge';

export function tableCollisionDetection(
    args: Parameters<CollisionDetection>[0],
): ReturnType<CollisionDetection> {
    const type = args.active.data.current?.reorderType;
    const columnGroup =
        type === REORDER_TYPE_COLUMN ? args.active.data.current?.columnGroup : undefined;
    const containers = args.droppableContainers.filter(
        (container) =>
            container.data.current?.reorderType === type &&
            (!columnGroup || container.data.current?.columnGroup === columnGroup),
    );
    const filteredArgs = {...args, droppableContainers: containers};

    return type === REORDER_TYPE_COLUMN
        ? closestLeadingColumnEdge(filteredArgs)
        : rectIntersection(filteredArgs);
}
