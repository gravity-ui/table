import type {Range} from '@tanstack/react-virtual';

export const distanceToRange = (index: number, range: Pick<Range, 'startIndex' | 'endIndex'>) => {
    if (index < range.startIndex) {
        return range.startIndex - index;
    }
    if (index > range.endIndex) {
        return index - range.endIndex;
    }
    return 0;
};
