import type {Range} from '@tanstack/react-virtual';

export const getDirectionalWindow = (
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    beforeRows: number,
    afterRows: number,
    count: number,
) => ({
    startIndex: Math.max(0, range.startIndex - beforeRows),
    endIndex: Math.min(count - 1, range.endIndex + afterRows),
});
