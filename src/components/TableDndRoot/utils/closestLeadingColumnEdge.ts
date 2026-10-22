import type {CollisionDetection} from '@dnd-kit/core';
import {closestCenter} from '@dnd-kit/core';

type CollisionArgs = Parameters<CollisionDetection>[0];
type CollisionResult = ReturnType<CollisionDetection>;

export function closestLeadingColumnEdge(args: CollisionArgs): CollisionResult {
    const initialRect = args.active.rect.current.initial;

    if (!initialRect) {
        return closestCenter(args);
    }

    const deltaX = args.collisionRect.left - initialRect.left;

    if (deltaX === 0) {
        return closestCenter(args);
    }

    const movingRight = deltaX > 0;
    const leadingEdge = movingRight ? args.collisionRect.right : args.collisionRect.left;

    const target = args.droppableContainers.find((container) => {
        const rect = args.droppableRects.get(container.id);

        if (!rect) {
            return false;
        }

        return movingRight
            ? leadingEdge >= rect.left && leadingEdge < rect.right
            : leadingEdge > rect.left && leadingEdge <= rect.right;
    });

    if (!target) {
        return closestCenter(args);
    }

    return [
        {
            id: target.id,
            data: {
                droppableContainer: target,
                value: 0,
            },
        },
    ];
}
