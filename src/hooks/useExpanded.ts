import React from 'react';

import {getExpandedRowModel} from '@tanstack/react-table';
import type {ExpandedOptions, ExpandedStateList} from '@tanstack/react-table';

export interface UseExpandedParams {
    expandedIds?: string[];
    onExpandedChange?: (expandedIds: string[]) => void;
}

export function useExpanded<TData>({expandedIds, onExpandedChange}: UseExpandedParams) {
    const expanded = React.useMemo(() => {
        const result: Record<string, boolean> = {};

        for (const id of expandedIds ?? []) {
            result[id] = true;
        }

        return result;
    }, [expandedIds]);

    const handleExpandedChange = React.useCallback<
        NonNullable<ExpandedOptions<TData>['onExpandedChange']>
    >(
        (getNewExpanded) => {
            const newExpanded = (
                typeof getNewExpanded === 'function' ? getNewExpanded(expanded) : getNewExpanded
            ) as ExpandedStateList;

            onExpandedChange?.(Object.keys(newExpanded).filter((key) => newExpanded[key]));
        },
        [onExpandedChange, expanded],
    );

    const enableExpanding = Boolean(onExpandedChange);

    return {
        enableExpanding,
        getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
        expanded,
        handleExpandedChange,
    };
}
