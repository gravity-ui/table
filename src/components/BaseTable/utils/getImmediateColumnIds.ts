import type {Column} from '@tanstack/react-table';

const OFFSCREEN_CELL_CONTENT_OVERSCAN = 400;

interface ImmediateColumnParams<TData> {
    bodyClientWidth: number;
    bodyDirection: string | undefined;
    bodyScrollLeft: number;
    canStageCellContent: boolean;
    centerColumns: Column<TData, unknown>[];
    columnGeometry: string;
    leftColumns: Column<TData, unknown>[];
    rightColumns: Column<TData, unknown>[];
}

export function getImmediateColumnIds<TData>({
    bodyClientWidth,
    bodyDirection,
    bodyScrollLeft,
    canStageCellContent,
    centerColumns,
    columnGeometry: _columnGeometry,
    leftColumns,
    rightColumns,
}: ImmediateColumnParams<TData>) {
    if (!canStageCellContent || bodyClientWidth <= 0 || bodyDirection === 'rtl') {
        return null;
    }

    const leftWidth = leftColumns.reduce((sum, column) => sum + column.getSize(), 0);
    const rightWidth = rightColumns.reduce((sum, column) => sum + column.getSize(), 0);
    const centerViewportWidth = Math.max(0, bodyClientWidth - leftWidth - rightWidth);
    const viewportStart = bodyScrollLeft - OFFSCREEN_CELL_CONTENT_OVERSCAN;
    const viewportEnd = bodyScrollLeft + centerViewportWidth + OFFSCREEN_CELL_CONTENT_OVERSCAN;

    return new Set(
        centerColumns
            .filter((column) => {
                const start = column.getStart('center');
                return start + column.getSize() > viewportStart && start < viewportEnd;
            })
            .map((column) => column.id),
    );
}
