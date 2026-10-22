import type {Virtualizer} from '@tanstack/react-virtual';

import {pendingVirtualizerElementCleanups} from './pendingVirtualizerElementCleanups';
import {scheduleMicrotask} from './scheduleMicrotask';

export const scheduleVirtualizerElementCleanup = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
) => {
    if (pendingVirtualizerElementCleanups.has(virtualizer)) {
        return;
    }

    pendingVirtualizerElementCleanups.add(virtualizer);
    scheduleMicrotask(() => {
        pendingVirtualizerElementCleanups.delete(virtualizer);
        virtualizer.measureElement(null);
    });
};
