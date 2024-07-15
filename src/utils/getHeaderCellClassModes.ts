import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Header} from '@tanstack/react-table';

import {getColumnPinningClassModes} from './getColumnPinningClassModes';

export function getHeaderCellClassModes<TData>(header: Header<TData, unknown>): NoStrictEntityMods {
    return {
        id: header.column.id,
        placeholder: header.isPlaceholder,
        sortable: header.column.getCanSort(),
        wide: header.colSpan > 1,
        ...getColumnPinningClassModes(header),
    };
}
