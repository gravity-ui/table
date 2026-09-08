import type {VirtualItem} from '@tanstack/react-virtual';

export function areVirtualItemsEqual(
    previousItem: VirtualItem | undefined,
    nextItem: VirtualItem | undefined,
    directDomUpdates: boolean,
) {
    return (
        previousItem?.key === nextItem?.key &&
        previousItem?.index === nextItem?.index &&
        previousItem?.lane === nextItem?.lane &&
        previousItem?.size === nextItem?.size &&
        (directDomUpdates || previousItem?.start === nextItem?.start)
    );
}
