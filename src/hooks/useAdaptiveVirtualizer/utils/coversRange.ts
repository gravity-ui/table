import type {Range} from '@tanstack/react-virtual';

import {createRange} from './createRange';

export const coversRange = (
    range: Pick<Range, 'startIndex' | 'endIndex'> | null,
    available: ReadonlySet<number> | undefined,
) =>
    Boolean(
        range &&
            available &&
            createRange(range.startIndex, range.endIndex).every((index) => available.has(index)),
    );
