import React from 'react';

import type {Row} from '@tanstack/react-table';

import {SortableListContext, TableContext} from '../components';

export interface UseDraggableRowDepthParams<TData> {
    row: Row<TData>;
    isDragging?: boolean;
}

export function useDraggableRowDepth<TData>({row, isDragging}: UseDraggableRowDepthParams<TData>) {
    const {
        isChildMode,
        isParentMode,
        isNextChildMode,
        targetItemIndex = -1,
    } = React.useContext(SortableListContext) ?? {};

    const {getRowByIndex, enableNesting} = React.useContext(TableContext);

    let isFirstChild = isDragging && targetItemIndex === -1;
    let depth = 0;

    if (enableNesting) {
        if (isDragging && targetItemIndex !== -1) {
            const targetItemDepth = getRowByIndex(targetItemIndex)?.depth ?? 0;
            const nextItemDepth = getRowByIndex(targetItemIndex + 1)?.depth ?? 0;

            isFirstChild = nextItemDepth > targetItemDepth;

            if (isFirstChild) {
                depth = nextItemDepth;

                if (isParentMode) {
                    depth--;
                }
            } else {
                const baseDepth = isNextChildMode
                    ? targetItemDepth
                    : Math.min(targetItemDepth, nextItemDepth);

                let childDepthOffset = 0;

                if (isParentMode) {
                    childDepthOffset = -1;
                } else if (isChildMode) {
                    childDepthOffset = 1;
                }

                depth = baseDepth + childDepthOffset;
            }

            depth = Math.max(0, depth);
        } else {
            depth = isFirstChild ? 0 : row.depth;
        }
    }

    return {
        depth,
        isFirstChild,
    };
}
