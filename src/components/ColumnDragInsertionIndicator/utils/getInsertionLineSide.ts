import type {Table} from '@tanstack/react-table';

import {getColumnGroup} from '../../ColumnReorderingProvider/utils/getColumnGroup';
import type {InsertionLineSide} from '../types';

export function getInsertionLineSide<TData>(
    table: Table<TData>,
    activeColumnId: string,
    targetColumnId: string,
): InsertionLineSide | null {
    if (activeColumnId === targetColumnId) {
        return null;
    }

    const group = getColumnGroup(table, activeColumnId);

    if (group !== getColumnGroup(table, targetColumnId)) {
        return null;
    }

    const draggedIndex = table.getColumn(activeColumnId)?.getIndex(group) ?? -1;
    const targetIndex = table.getColumn(targetColumnId)?.getIndex(group) ?? -1;

    if (draggedIndex === -1 || targetIndex === -1) {
        return null;
    }

    return targetIndex > draggedIndex ? 'right' : 'left';
}
