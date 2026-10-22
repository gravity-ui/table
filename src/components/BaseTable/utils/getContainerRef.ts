import type {ReactVirtualizer, Virtualizer} from '@tanstack/react-virtual';

export function getContainerRef<TScrollElement extends Element | Window>(
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>,
) {
    return (
        rowVirtualizer as Partial<ReactVirtualizer<TScrollElement, HTMLTableRowElement>> | undefined
    )?.containerRef;
}
