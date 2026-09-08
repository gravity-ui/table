import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

import {applyRowVirtualizerCoverage} from './applyRowVirtualizerCoverage';
import {applyRowVirtualizerPositions} from './applyRowVirtualizerPositions';
import {clearRowVirtualizerDirectDomPositions} from './clearRowVirtualizerDirectDomPositions';

export const syncRowVirtualizerDom = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
) => {
    const mutableRuntime = runtime;
    const appliedMode = runtime.directDomUpdatesAppliedMode;

    if (!runtime.directDomUpdates) {
        if (appliedMode) {
            clearRowVirtualizerDirectDomPositions(virtualizer, runtime, appliedMode);
            mutableRuntime.directDomUpdatesAppliedMode = null;
        }
        return;
    }

    if (appliedMode && appliedMode !== runtime.directDomUpdatesMode) {
        clearRowVirtualizerDirectDomPositions(virtualizer, runtime, appliedMode);
    }
    applyRowVirtualizerPositions(virtualizer, runtime);
    applyRowVirtualizerCoverage(virtualizer, runtime);
    mutableRuntime.directDomUpdatesAppliedMode = runtime.directDomUpdatesMode;
};
