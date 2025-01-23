import * as React from 'react';

import type {Row, Table} from '@tanstack/react-table';

import {SortableListContext} from '../components';

export interface UseDraggableRowDepthOptions<TData> {
    /** Row object */
    row: Row<TData>;
    /** The table instance returned from the `useTable` hook */
    table: Table<TData>;
    /** Determines whether the row is being dragged */
    isDragging?: boolean;
}

export const useDraggableRowDepth = <TData>({
    row,
    table,
    isDragging,
}: UseDraggableRowDepthOptions<TData>) => {
    const {
        isChildMode,
        isParentMode,
        isNextChildMode,
        targetItemIndex = -1,
        enableNesting,
    } = React.useContext(SortableListContext) ?? {};

    let isFirstChild = isDragging && targetItemIndex === -1;
    let depth = 0;

    if (enableNesting) {
        if (isDragging && targetItemIndex !== -1) {
            const rows = table.getRowModel().rows;
            const targetItemDepth = rows[targetItemIndex]?.depth ?? 0;
            const nextItemDepth = rows[targetItemIndex + 1]?.depth ?? 0;

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
};
