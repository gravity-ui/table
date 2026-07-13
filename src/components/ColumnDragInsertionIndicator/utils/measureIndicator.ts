import type * as React from 'react';

import {b as cnTable} from '../../BaseTable/BaseTable.classname';
import {escapeClassName} from '../../ColumnReorderingProvider/utils/escapeClassName';
import type {InsertionLineSide} from '../types';

export function measureIndicator(
    scopeRef: React.RefObject<HTMLElement>,
    targetColumnId: string,
    side: InsertionLineSide,
): React.CSSProperties | null {
    const root = scopeRef.current;

    if (!root) {
        return null;
    }

    const headerCellEl = root.querySelector(
        `.${escapeClassName(`${cnTable('header-cell')}_id_${targetColumnId}`)}`,
    );

    if (!headerCellEl) {
        return null;
    }

    const tableEl = headerCellEl.closest('table');

    if (!tableEl) {
        return null;
    }

    const headerRect = headerCellEl.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();

    return {
        top: tableRect.top,
        height: tableRect.height,
        left: side === 'left' ? headerRect.left : headerRect.right,
        transform: side === 'right' ? 'translateX(-100%)' : undefined,
    };
}
