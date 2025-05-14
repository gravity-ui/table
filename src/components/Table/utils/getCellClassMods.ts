import type {NoStrictEntityMods} from '@bem-react/classname';

import type {Cell} from '../../../types/tanstack';

export const getCellClassMods = <TData>(cell?: Cell<TData, unknown>): NoStrictEntityMods | null => {
    if (!cell) {
        return null;
    }

    const columnDef = cell.column.columnDef;

    return {
        'no-border': cell.row.parentId !== undefined,
        'with-nesting': columnDef.withNestingStyles,
        'with-depth-indicators':
            columnDef.withNestingStyles && (columnDef.showTreeDepthIndicators ?? true),
    };
};
