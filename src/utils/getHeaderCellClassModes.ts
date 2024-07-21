import type {NoStrictEntityMods} from '@bem-react/classname';
import type {Header} from '@tanstack/react-table';

import {getColumnPinningClassModes} from './getColumnPinningClassModes';

export const getHeaderCellClassModes = <TData>(
    header: Header<TData, unknown>,
): NoStrictEntityMods => ({
    id: header.column.id,
    placeholder: header.isPlaceholder,
    sortable: header.column.getCanSort(),
    wide: header.colSpan > 1,
    ...getColumnPinningClassModes(header),
});
