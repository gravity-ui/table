import type {Range} from '@tanstack/react-virtual';

import {coversRange} from './coversRange';

export const getContiguousCoverageWindow = (
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    available: ReadonlySet<number>,
    count: number,
) => {
    if (!coversRange(range, available)) {
        return null;
    }
    let startIndex = range.startIndex;
    let endIndex = range.endIndex;
    while (startIndex > 0 && available.has(startIndex - 1)) {
        startIndex -= 1;
    }
    while (endIndex < count - 1 && available.has(endIndex + 1)) {
        endIndex += 1;
    }
    return {startIndex, endIndex};
};
