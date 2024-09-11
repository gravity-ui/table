import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Cell, Header} from '@tanstack/react-table';

export const getColumnPinningClassModes = <TData>(
    cell: Cell<TData, unknown> | Header<TData, unknown>,
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
