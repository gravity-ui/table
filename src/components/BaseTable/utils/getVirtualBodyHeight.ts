import type {Virtualizer} from '@tanstack/react-virtual';

export function getVirtualBodyHeight<TScrollElement extends Element | Window>(
    hasRows: boolean,
    rowVirtualizer: Virtualizer<TScrollElement, HTMLTableRowElement> | undefined,
) {
    return hasRows ? rowVirtualizer?.getTotalSize() : undefined;
}
