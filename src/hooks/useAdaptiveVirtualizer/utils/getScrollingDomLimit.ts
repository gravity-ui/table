import type {Range} from '@tanstack/react-virtual';

export const getScrollingDomLimit = (
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    overscan: number,
) => range.endIndex - range.startIndex + 1 + overscan * 4;
