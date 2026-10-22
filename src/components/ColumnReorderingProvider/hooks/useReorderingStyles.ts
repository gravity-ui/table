import * as React from 'react';

import type {Table} from '@tanstack/react-table';

import {b} from '../../BaseTable/BaseTable.classname';
import {escapeClassName} from '../utils/escapeClassName';
import {getColumnGroup} from '../utils/getColumnGroup';

interface UseReorderingStylesParams<TData> {
    table: Table<TData>;
    scopeClassName: string;
    activeColumnId: string | null;
}

export function useReorderingStyles<TData>({
    table,
    scopeClassName,
    activeColumnId,
}: UseReorderingStylesParams<TData>): string | null {
    return React.useMemo(() => {
        if (!activeColumnId) {
            return null;
        }

        const getColumnSelector = (columnId: string, suffix = '') => {
            const cellClass = escapeClassName(`${b('cell')}_id_${columnId}`);
            const headerCellClass = escapeClassName(`${b('header-cell')}_id_${columnId}`);

            return `.${scopeClassName} .${cellClass}${suffix}, .${scopeClassName} .${headerCellClass}${suffix}`;
        };

        const group = getColumnGroup(table, activeColumnId);

        const rules: string[] = [];

        const draggedOpacity = 'var(--gt-table-reordering-dragged-opacity, 0.4)';

        if (group === 'center') {
            rules.push(`${getColumnSelector(activeColumnId)} { opacity: ${draggedOpacity}; }`);
        } else {
            rules.push(
                `${getColumnSelector(activeColumnId)} { color: color-mix(in srgb, currentColor calc(${draggedOpacity} * 100%), transparent); }`,
                `${getColumnSelector(activeColumnId, ' :is(img, svg, picture, video, canvas)')} { opacity: ${draggedOpacity}; }`,
            );
        }

        return rules.join('\n');
    }, [table, activeColumnId, scopeClassName]);
}
