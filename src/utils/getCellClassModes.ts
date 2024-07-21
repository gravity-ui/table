import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Cell} from '@tanstack/react-table';

import {getColumnPinningClassModes} from './getColumnPinningClassModes';

export const getCellClassModes = <TData>(
    cell?: Cell<TData, unknown>,
): NoStrictEntityMods | null => {
    if (!cell) {
        return null;
    }

    return {
        id: cell.column.id,
        ...getColumnPinningClassModes(cell),
    };
};
