export function clearRowVirtualizerPosition(element: HTMLTableRowElement) {
    const elementStyle = element.style;

    elementStyle.left = '';
    elementStyle.top = '';
    elementStyle.transform = '';
}
