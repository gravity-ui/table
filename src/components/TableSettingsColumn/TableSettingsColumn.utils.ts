import type {Column, VisibilityState} from '@tanstack/react-table';

export const getIsVisible = <TData extends unknown>(
    column: Column<TData>,
    visibilityState: VisibilityState,
): boolean => {
    if (column.columns.length)
        return column.columns.some((innerColumn) => getIsVisible(innerColumn, visibilityState));
    return visibilityState[column.id] ?? true;
};

export const isEnabledHiding = <TData extends unknown>(column: Column<TData>): boolean =>
    column.columnDef.enableHiding ?? true;
