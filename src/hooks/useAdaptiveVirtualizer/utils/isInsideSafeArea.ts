import type {Range} from '@tanstack/react-virtual';

import type {AdaptiveMotionPlan} from '../types';

export const isInsideSafeArea = (
    range: Pick<Range, 'startIndex' | 'endIndex'>,
    coverage: Pick<Range, 'startIndex' | 'endIndex'> | null,
    plan: AdaptiveMotionPlan,
    count: number,
) => {
    if (!coverage) {
        return false;
    }
    const safeStart = coverage.startIndex === 0 ? 0 : coverage.startIndex + plan.startGuard;
    const safeEnd = coverage.endIndex === count - 1 ? count - 1 : coverage.endIndex - plan.endGuard;
    return range.startIndex >= safeStart && range.endIndex <= safeEnd;
};
