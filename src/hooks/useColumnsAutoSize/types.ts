import type {ColumnDef, Row} from '@tanstack/react-table';

import {useTable} from '../useTable';

import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';

export type UseColumnsAutoSizeOptions = {
    minWidth?: number;
    maxWidth?: number;
    padding?: number;
    headerPadding?: number;
    sampleSize?: number;
    measureHeaderText?: boolean;
    respectExistingWidths?: boolean;
    respectResizedWidths?: boolean;
};

export type CalculateColumnWidthsArgs<TData extends unknown> = UseColumnsAutoSizeOptions & {
    tableInstance: ReturnType<typeof useTable<TData>> | null;
    columnSizing: Record<string, number>;
    columns: ColumnDef<TData>[];
    measureCellWidth: ReturnType<typeof useMeasureCellWidth>;
    sampledRows: Row<TData>[];
};
