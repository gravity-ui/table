import type {Range} from '@tanstack/react-virtual';

import {WARM_UNMOUNT_CHUNK_SIZE} from '../constants';

import {getScrollingDomLimit} from './getScrollingDomLimit';

export const getRecoveryOutputLimit = (
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    overscan: number,
    committedCount: number,
    criticalCount: number,
    growthCapacity: number,
) =>
    Math.max(
        criticalCount,
        Math.min(
            getScrollingDomLimit(range, overscan),
            range.endIndex - range.startIndex + 1 + overscan * 2 + WARM_UNMOUNT_CHUNK_SIZE,
            committedCount + growthCapacity,
        ),
    );
