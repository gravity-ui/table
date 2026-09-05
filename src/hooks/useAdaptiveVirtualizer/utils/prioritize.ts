import type {Range} from '@tanstack/react-virtual';

import type {AdaptiveScrollDirection} from '../types';

import {distanceToRange} from './distanceToRange';
import {getDirectionalPriority} from './getDirectionalPriority';

export const prioritize = (
    indexes: readonly number[],
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    direction: AdaptiveScrollDirection,
) =>
    [...indexes].sort(
        (left, right) =>
            getDirectionalPriority(left, range, direction) -
                getDirectionalPriority(right, range, direction) ||
            distanceToRange(left, range) - distanceToRange(right, range) ||
            left - right,
    );
