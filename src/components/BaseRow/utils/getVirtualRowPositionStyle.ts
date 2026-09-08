import * as React from 'react';

import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

export function getVirtualRowPositionStyle<TScrollElement extends Element | Window>(
    rowVirtualizer: Virtualizer<TScrollElement, HTMLTableRowElement> | undefined,
    virtualItem: VirtualItem | undefined,
    deferred: boolean,
    directDomUpdates: boolean,
    directDomUpdatesMode: 'position' | 'transform',
): React.CSSProperties {
    if (!rowVirtualizer || !virtualItem) {
        return {};
    }

    const position = virtualItem.start - rowVirtualizer.options.scrollMargin;
    if (!directDomUpdates) {
        return {top: position};
    }
    if (!deferred) {
        return {};
    }

    return directDomUpdatesMode === 'position'
        ? {top: position}
        : {transform: `translate3d(0, ${position}px, 0)`};
}
