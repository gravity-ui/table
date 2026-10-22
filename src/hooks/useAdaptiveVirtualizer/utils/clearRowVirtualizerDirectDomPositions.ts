import type {Virtualizer} from '@tanstack/react-virtual';

import type {DirectDomUpdatesMode, RowVirtualizerRuntime} from '../types';

export const clearRowVirtualizerDirectDomPositions = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
    mode: DirectDomUpdatesMode,
) => {
    const positionAxis = virtualizer.options.horizontal ? 'left' : 'top';

    const clearElementPosition = (element: HTMLTableRowElement) => {
        const elementStyle = element.style;
        if (mode === 'transform') {
            elementStyle.transform = '';
        } else {
            elementStyle[positionAxis] = '';
        }
    };

    for (const element of virtualizer.elementsCache.values()) {
        clearElementPosition(element);
    }
    for (const element of runtime.placeholderElements.values()) {
        clearElementPosition(element);
    }
};
