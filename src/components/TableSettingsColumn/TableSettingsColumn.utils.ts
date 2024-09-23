import type {Column, VisibilityState} from '@tanstack/react-table';

export const hasChildrenColumns = <TData extends unknown>(
    column: Column<TData, unknown>,
): boolean => column.columns.length > 0;

export const getIsVisible = <TData extends unknown>(
    column: Column<TData, unknown>,
    visibilityState: VisibilityState,
): boolean => {
    if (hasChildrenColumns(column))
        return column.columns.some((innerColumn) => getIsVisible(innerColumn, visibilityState));
    return visibilityState[column.id] ?? true;
};

export const isEnabledHidding = <TData extends unknown>(column: Column<TData, unknown>): boolean =>
    column.columnDef.enableHiding ?? true;
