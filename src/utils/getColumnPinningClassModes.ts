import type {NoStrictEntityMods} from '@bem-react/classname';

import type {Cell, Header} from '../types/tanstack';

export const getColumnPinningClassModes = <TData, TValue = unknown>(
    cell: Cell<TData, TValue> | Header<TData, TValue>,
): NoStrictEntityMods => {
    const isPinned = cell.column.getIsPinned();
    const isPinnedLeft = isPinned === 'left';
    const isPinnedRight = isPinned === 'right';
    const isLastPinnedLeft = isPinnedLeft && cell.column.getIsLastColumn('left');
    const isFirstPinnedRight = isPinnedRight && cell.column.getIsFirstColumn('right');

    return {
        pinned: Boolean(isPinned),
        'pinned-left': isPinnedLeft,
        'pinned-right': isPinnedRight,
        'last-pinned-left': isLastPinnedLeft,
        'first-pinned-right': isFirstPinnedRight,
    };
};
