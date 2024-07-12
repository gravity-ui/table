import type React from 'react';

import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Column} from '@tanstack/react-table';

export function getCommonPinningStyles<TData>(column: Column<TData>): React.CSSProperties {
    const isPinned = column.getIsPinned();

    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0,
    };
}

export function getCommonPinningClassModes<TData>(column: Column<TData>): NoStrictEntityMods {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

    return {
        pinnedLeft: isPinned === 'left',
        pinnedRight: isPinned === 'right',
        lastPinnedLeft: isLastLeftPinnedColumn,
        firstPinnedRight: isFirstRightPinnedColumn,
    };
}
