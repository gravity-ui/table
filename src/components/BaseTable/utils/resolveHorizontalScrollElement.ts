export function resolveHorizontalScrollElement(
    bodyElement: HTMLTableSectionElement | null,
    rowScrollElement: Element | Window | null | undefined,
) {
    const targetWindow = bodyElement?.ownerDocument.defaultView;
    if (!targetWindow) {
        return null;
    }
    let ancestor = bodyElement?.parentElement;
    while (ancestor) {
        const {overflowX} = targetWindow.getComputedStyle(ancestor);
        if (
            ancestor.scrollWidth > ancestor.clientWidth &&
            ['auto', 'overlay', 'scroll'].includes(overflowX)
        ) {
            return ancestor;
        }
        ancestor = ancestor.parentElement;
    }

    if (
        rowScrollElement &&
        'document' in rowScrollElement &&
        rowScrollElement.document.documentElement.scrollWidth > rowScrollElement.innerWidth
    ) {
        return rowScrollElement;
    }

    return null;
}
