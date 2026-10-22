import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

export const applyRowVirtualizerPositions = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
) => {
    const horizontal = Boolean(virtualizer.options.horizontal);
    const positionAxis = horizontal ? 'left' : 'top';
    const crossPositionAxis = horizontal ? 'top' : 'left';
    const useTransform = runtime.directDomUpdatesMode === 'transform';
    const {scrollMargin} = virtualizer.options;

    for (const item of virtualizer.getVirtualItems()) {
        const element =
            virtualizer.elementsCache.get(item.key) ?? runtime.placeholderElements.get(item.key);
        if (!element) {
            continue;
        }

        const position = item.start - scrollMargin;
        const elementStyle = element.style;
        if (elementStyle[crossPositionAxis]) {
            elementStyle[crossPositionAxis] = '';
        }
        if (useTransform) {
            const transform = horizontal
                ? `translate3d(${position}px, 0, 0)`
                : `translate3d(0, ${position}px, 0)`;

            if (elementStyle[positionAxis]) {
                elementStyle[positionAxis] = '';
            }
            if (elementStyle.transform !== transform) {
                elementStyle.transform = transform;
            }
        } else {
            const offset = `${position}px`;

            // Position mode deliberately leaves transforms to the row consumer. In particular,
            // dnd-kit updates the transform of sortable rows while the virtualizer updates `top`.
            if (elementStyle[positionAxis] !== offset) {
                elementStyle[positionAxis] = offset;
            }
        }
    }
};
