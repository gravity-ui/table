import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

import {getRowVirtualizerCoverage} from './getRowVirtualizerCoverage';
import {getRowVirtualizerSkeletonOpacity} from './getRowVirtualizerSkeletonOpacity';

export const applyRowVirtualizerCoverage = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
) => {
    const {bodyElement} = runtime;
    if (!bodyElement) {
        return;
    }

    const coverage = getRowVirtualizerCoverage(virtualizer, runtime.renderedRows);

    if (coverage) {
        bodyElement.dataset.virtualizationCoverage = coverage;
    } else {
        delete bodyElement.dataset.virtualizationCoverage;
    }

    bodyElement.style.setProperty(
        '--g-table-virtualization-skeleton-opacity',
        getRowVirtualizerSkeletonOpacity(coverage),
    );
};
