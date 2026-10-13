export interface ColumnAwareRowOverscanOptions {
    /** Maximum number of rendered columns per row, including pinned and overscanned columns. */
    renderedColumnLimit?: number;
    /** Target cell budget for the base row overscan, not a strict rendered-cell limit. Default: 240. */
    cellBudget?: number;
    /** Minimum base row overscan. Default: 4. */
    minOverscan?: number;
    /** Maximum base row overscan. Default: 24. */
    maxOverscan?: number;
}

function assertNonNegativeInteger(value: number, name: string): void {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`${name} must be a non-negative safe integer`);
    }
}

/**
 * Calculates a base row overscan for useRowVirtualizer or useWindowRowVirtualizer.
 * Pass the number of visible leaf columns, including pinned columns. Empty tables
 * use an effective column count of one to keep the result finite during loading.
 * All inputs must be non-negative safe integers, with maxOverscan >= minOverscan.
 * The adaptive virtualizer may extend the rendered range beyond this base overscan.
 *
 * @param columnCount - Number of visible leaf columns, including pinned columns.
 * @returns Base row overscan, bounded by minOverscan and maxOverscan.
 * @throws {RangeError} If an input is invalid or the bounds conflict.
 */
export function getColumnAwareRowOverscan(
    columnCount: number,
    {
        renderedColumnLimit = columnCount,
        cellBudget = 240,
        minOverscan = 4,
        maxOverscan = 24,
    }: ColumnAwareRowOverscanOptions = {},
): number {
    assertNonNegativeInteger(columnCount, 'columnCount');
    assertNonNegativeInteger(renderedColumnLimit, 'renderedColumnLimit');
    assertNonNegativeInteger(cellBudget, 'cellBudget');
    assertNonNegativeInteger(minOverscan, 'minOverscan');
    assertNonNegativeInteger(maxOverscan, 'maxOverscan');

    if (maxOverscan < minOverscan) {
        throw new RangeError('maxOverscan must be greater than or equal to minOverscan');
    }

    const effectiveColumnCount = Math.max(1, Math.min(columnCount, renderedColumnLimit));

    return Math.max(
        minOverscan,
        Math.min(maxOverscan, Math.floor(cellBudget / effectiveColumnCount)),
    );
}
