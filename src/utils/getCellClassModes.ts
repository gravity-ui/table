import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Cell} from '@tanstack/react-table';

import {getColumnPinningClassModes} from './getColumnPinningClassModes';

export function getCellClassModes<TData>(cell: Cell<TData, unknown>): NoStrictEntityMods {
    return {
        id: cell.column.id,
        ...getColumnPinningClassModes(cell),
    };
}
