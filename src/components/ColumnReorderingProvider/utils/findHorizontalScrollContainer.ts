export function findHorizontalScrollContainer(start: Element | null): HTMLElement | null {
    let element: HTMLElement | null =
        start instanceof HTMLElement ? start : (start?.parentElement ?? null);

    while (element) {
        const {overflowX} = getComputedStyle(element);

        if (
            (overflowX === 'auto' || overflowX === 'scroll') &&
            element.scrollWidth > element.clientWidth
        ) {
            return element;
        }

        element = element.parentElement;
    }

    return null;
}
