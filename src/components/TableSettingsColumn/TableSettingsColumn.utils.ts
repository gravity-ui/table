import type {VisibilityState, Header} from '@tanstack/react-table';

import type {Column} from '../../types/base';

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

export const getColumnTitle = <TData extends unknown>(
    column: Column<TData, unknown>,
    header: Header<TData, unknown>,
) => {
    const {columnDef} = column;
    if (columnDef.meta?.titleInSettings) {
        const titleInSettings = columnDef.meta?.titleInSettings;
        return typeof titleInSettings === 'function' ? titleInSettings(column) : titleInSettings;
    }

    const columnHeader = columnDef.header;
    return typeof columnHeader === 'function' ? columnHeader(header?.getContext()) : columnHeader;
};
