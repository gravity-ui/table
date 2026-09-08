export function isCurrentMeasurementTarget(
    node: HTMLTableRowElement,
    virtualIndex: number | undefined,
    _measurementVersion: string,
) {
    return virtualIndex === undefined || Number(node.dataset.index) === virtualIndex;
}
