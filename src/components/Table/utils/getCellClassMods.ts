import type {NoStrictEntityMods} from '@bem-react/classname';

import type {Cell} from '../types';

import {getWithDepthIndicatorsMod} from './cellMods/getWithDepthIndicatorsMod';

export const getCellClassMods = <TData>(cell?: Cell<TData, unknown>): NoStrictEntityMods | null => {
    if (!cell) {
        return null;
    }

    const columnDef = cell.column.columnDef;

    return {
        'no-border': cell.row.parentId !== undefined,
        'tree-node': columnDef.isTreeNode,
        ...getWithDepthIndicatorsMod(columnDef),
    };
};
