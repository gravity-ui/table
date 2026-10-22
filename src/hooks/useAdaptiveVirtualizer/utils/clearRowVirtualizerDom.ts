import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

import {clearRowVirtualizerPosition} from './clearRowVirtualizerPosition';

export const clearRowVirtualizerDom = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
) => {
    const mutableRuntime = runtime;
    const {bodyElement, placeholderElements} = runtime;

    for (const element of virtualizer.elementsCache.values()) {
        clearRowVirtualizerPosition(element);
    }
    for (const element of placeholderElements.values()) {
        clearRowVirtualizerPosition(element);
    }
    placeholderElements.clear();
    mutableRuntime.directDomUpdatesAppliedMode = null;

    if (bodyElement) {
        delete bodyElement.dataset.virtualizationCoverage;
        bodyElement.style.removeProperty('--g-table-virtualization-skeleton-opacity');
    }
};
