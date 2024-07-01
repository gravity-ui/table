import {defaultRangeExtractor} from '@tanstack/react-virtual';
import type {Range} from '@tanstack/react-virtual';

export function getVirtualRangeExtractor(container?: HTMLElement | null) {
    return function (range: Range) {
        const table = container?.querySelector('[data-draggable-index]');
        const draggableItemIndex = Number(table?.getAttribute('data-draggable-index') ?? -1);

        const result = defaultRangeExtractor(range);

        if (draggableItemIndex !== -1 && !result.includes(draggableItemIndex)) {
            result.push(draggableItemIndex);
        }

        return result;
    };
}
