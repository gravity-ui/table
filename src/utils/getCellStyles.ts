import type React from 'react';

import type {Cell, Header} from '@tanstack/react-table';

export function getCellStyles<TData>({
    column,
}: Cell<TData, unknown> | Header<TData, unknown>): React.CSSProperties {
    const isPinned = column.getIsPinned();

    return {
        width: column.getSize(),
        minWidth: column.columnDef.minSize,
        maxWidth: column.columnDef.maxSize,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : undefined,
        zIndex: isPinned ? 1 : undefined,
    };
}
