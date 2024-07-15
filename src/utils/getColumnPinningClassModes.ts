import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Cell, Header} from '@tanstack/react-table';

export function getColumnPinningClassModes<TData>({
    column,
}: Cell<TData, unknown> | Header<TData, unknown>): NoStrictEntityMods {
    const isPinned = column.getIsPinned();

    const isPinnedLeft = isPinned === 'left';
    const isPinnedRight = isPinned === 'right';

    const isLastLeftPinnedColumn = isPinnedLeft && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn = isPinnedRight && column.getIsFirstColumn('right');

    return {
        'pinned-left': isPinnedLeft,
        'pinned-right': isPinnedRight,
        'last-pinned-left': isLastLeftPinnedColumn,
        'first-pinned-right': isFirstRightPinnedColumn,
    };
}
