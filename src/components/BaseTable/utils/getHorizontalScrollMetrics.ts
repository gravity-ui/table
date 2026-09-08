interface HorizontalScrollMetrics {
    clientWidth: number;
    direction: string | undefined;
    scrollLeft: number;
}

export function getHorizontalScrollMetrics(
    scrollElement: Element | Window | null | undefined,
): HorizontalScrollMetrics | null {
    if (!scrollElement) {
        return null;
    }

    if ('document' in scrollElement) {
        return {
            clientWidth: scrollElement.innerWidth,
            direction: scrollElement.getComputedStyle(scrollElement.document.documentElement)
                .direction,
            scrollLeft: scrollElement.scrollX,
        };
    }

    if (!('clientWidth' in scrollElement) || !('scrollLeft' in scrollElement)) {
        return null;
    }

    return {
        clientWidth: scrollElement.clientWidth,
        direction:
            scrollElement.ownerDocument.defaultView?.getComputedStyle(scrollElement).direction,
        scrollLeft: scrollElement.scrollLeft,
    };
}
