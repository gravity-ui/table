import type React from 'react';

import type {Cell, Header} from '@tanstack/react-table';

export const getCellStyles = <TData>(
    cell?: Cell<TData, unknown> | Header<TData, unknown>,
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
        position: isPinned ? 'sticky' : undefined,
        zIndex: isPinned ? 1 : undefined,
        ...style,
    };
};
