import React from 'react';

import type {RowSelectionOptions, RowSelectionState} from '@tanstack/react-table';

export interface UseSelectionParams {
    selectedIds?: string[];
    onSelectedChange?: (selectedIds: string[]) => void;
}

export function useSelection<TData>({selectedIds, onSelectedChange}: UseSelectionParams) {
    const rowSelection = React.useMemo(() => {
        const result: Record<string, boolean> = {};

        for (const id of selectedIds ?? []) {
            result[id] = true;
        }

        return result;
    }, [selectedIds]);

    const handleRowSelectionChange = React.useCallback<
        NonNullable<RowSelectionOptions<TData>['onRowSelectionChange']>
    >(
        (getNewRowSelection) => {
            const newRowSelection = (
                getNewRowSelection as (oldSelection: RowSelectionState) => RowSelectionState
            )(rowSelection);

            onSelectedChange?.(Object.keys(newRowSelection).filter((key) => newRowSelection[key]));
        },
        [onSelectedChange, rowSelection],
    );

    return {
        enableRowSelection: Boolean(onSelectedChange),
        enableMultiRowSelection: Boolean(onSelectedChange),
        rowSelection,
        handleRowSelectionChange,
    };
}
