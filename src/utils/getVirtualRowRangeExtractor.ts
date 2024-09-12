import {defaultRangeExtractor} from '@tanstack/react-virtual';
import type {Range} from '@tanstack/react-virtual';

/**
 * @param table - `<table>` html element
 *
 * @returns rangeExtractor to be used in the `useRowVirtualizer` or `useWindowRowVirtualizer` hooks
 */
export const getVirtualRowRangeExtractor = (table?: HTMLTableElement | null) => {
    return (range: Range): number[] => {
        const draggingRowIndex = Number(table?.getAttribute('data-dragging-row-index') ?? -1);

        const result = defaultRangeExtractor(range);

        if (draggingRowIndex !== -1 && !result.includes(draggingRowIndex)) {
            result.push(draggingRowIndex);
        }

        return result;
    };
};
