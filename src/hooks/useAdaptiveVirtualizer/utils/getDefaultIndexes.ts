import type {Range} from '@tanstack/react-virtual';

import {createRange} from './createRange';

export const getDefaultIndexes = (range: Range) =>
    createRange(
        Math.max(0, range.startIndex - range.overscan),
        Math.min(range.count - 1, range.endIndex + range.overscan),
    );
