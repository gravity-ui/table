import type {VirtualizationCoverage} from '../types';

export const getRowVirtualizerSkeletonOpacity = (coverage: VirtualizationCoverage | undefined) =>
    coverage === 'complete' ? '0' : '0.65';
