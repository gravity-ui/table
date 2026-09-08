import type {Range} from '@tanstack/react-virtual';

import type {AdaptiveScrollDirection} from '../types';

export const getDirectionalPriority = (
    index: number,
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    direction: AdaptiveScrollDirection,
) => {
    if (direction === 'forward') {
        if (index > range.endIndex) {
            return 0;
        }
        if (index < range.startIndex) {
            return 2;
        }
        return 1;
    }
    if (direction === 'backward') {
        if (index < range.startIndex) {
            return 0;
        }
        if (index > range.endIndex) {
            return 2;
        }
        return 1;
    }
    return 1;
};
