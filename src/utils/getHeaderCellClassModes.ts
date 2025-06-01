import type {NoStrictEntityMods} from '@bem-react/classname';

import type {Header} from '../types/base';

import {getColumnPinningClassModes} from './getColumnPinningClassModes';

export const getHeaderCellClassModes = <TData, TValue = unknown>(
    header: Header<TData, TValue>,
): NoStrictEntityMods => ({
    id: header.column.id,
    placeholder: header.isPlaceholder,
    sortable: header.column.getCanSort(),
    wide: header.colSpan > 1,
    ...getColumnPinningClassModes(header),
});
