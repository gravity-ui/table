export function getElementClassName(element?: Element | null) {
    return element instanceof HTMLElement ? element.className : undefined;
}
