import * as React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

import {SortableListContext} from '../components';

export interface UseDraggableRowStyleParams
    extends Pick<ReturnType<typeof useSortable>, 'transform' | 'transition' | 'isDragging'> {
    isDragActive?: boolean;
    isFirstChild?: boolean;
    draggableChildRowOffset?: number;
    style?: React.CSSProperties;
    enableNesting?: boolean;
}

const defaultStyle = {};

export const useDraggableRowStyle = ({
    style = defaultStyle,
    transform,
    transition,
    isDragging,
    isDragActive,
    isFirstChild,
    draggableChildRowOffset = 32,
    enableNesting,
}: UseDraggableRowStyleParams) => {
    const {isChildMode, isParentMode} = React.useContext(SortableListContext) ?? {};

    return React.useMemo(() => {
        if (!isDragActive || !transform) {
            return style;
        }

        let x = 0;

        if (enableNesting && isDragging) {
            if (isParentMode) {
                x = -draggableChildRowOffset;
            } else if (isChildMode && !isFirstChild) {
                x = draggableChildRowOffset;
            }
        }

        return {
            ...style,
            transition,
            transform: `translate3d(${Math.max(x, 0)}px, ${transform.y}px, 0)`,
        };
    }, [
        draggableChildRowOffset,
        isChildMode,
        isDragActive,
        isDragging,
        isFirstChild,
        isParentMode,
        style,
        transform,
        transition,
        enableNesting,
    ]);
};
