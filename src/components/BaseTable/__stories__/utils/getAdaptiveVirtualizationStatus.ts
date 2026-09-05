import type {Item} from '../types';

export function getAdaptiveVirtualizationStatus(index: number): Item['status'] {
    if (index % 17 === 0) {
        return 'unknown';
    }
    if (index % 7 === 0) {
        return 'busy';
    }
    return 'free';
}
