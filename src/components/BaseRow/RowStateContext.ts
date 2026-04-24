import * as React from 'react';

import type {Row} from '@tanstack/react-table';

export interface RowState {
    isSelected: boolean;
    isExpanded: boolean;
    depth: number;
}

export const RowStateContext = React.createContext<RowState | undefined>(undefined);

/** Returns the RowState provided by MemoBaseRow, or undefined when used outside the memo path. */
export const useRowState = (): RowState | undefined => React.useContext(RowStateContext);

/**
 * Returns whether the given row is expanded.
 * When rendered inside MemoBaseRow, reads from RowStateContext so the value
 * is stable across unrelated parent re-renders. Falls back to row.getIsExpanded()
 * in the non-memoized code path.
 */
export const useIsExpanded = <TData>(row: Row<TData>): boolean => {
    const state = useRowState();
    return state?.isExpanded ?? row.getIsExpanded();
};
