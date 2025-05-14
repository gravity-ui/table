import type * as React from 'react';

import type {Cell, Header} from '../types/tanstack';

export const getCellStyles = <TData, TValue = unknown>(
    cell?: Cell<TData, TValue> | Header<TData, TValue>,
    style?: React.CSSProperties,
): React.CSSProperties | undefined => {
    if (!cell) {
        return style;
    }

    const isPinned = cell.column.getIsPinned();

    return {
        width: cell.column.getSize(),
        minWidth: cell.column.columnDef.minSize,
        maxWidth: cell.column.columnDef.maxSize,
        left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
        ...style,
    };
};
