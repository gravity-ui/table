import type * as React from 'react';

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
    measureOnce?: boolean;
    /** Let React 18+ interrupt rendering cells after measurement. No-op in React 17. */
    deferUpdates?: boolean;
};

export type AutoSizeContent = {
    text: string | number;
    /** Space reserved for icons/buttons, in px or as a CSS length expression. */
    extraWidth?: number | string;
    className?: string;
    style?: React.CSSProperties;
};

type AutoSizeValue<TData, TValue, TResult> = TResult | ((value: TValue, row: TData) => TResult);

export type ColumnAutoSize<TData, TValue = unknown> = {
    /** Formatted visible text. Defaults to the column accessor's primitive value. */
    text?: AutoSizeValue<TData, TValue, string | number | null | undefined>;
    extraWidth?: AutoSizeValue<TData, TValue, number | string | undefined>;
    className?: AutoSizeValue<TData, TValue, string | undefined>;
    style?: AutoSizeValue<TData, TValue, React.CSSProperties | undefined>;
    /** Required for custom React headers; string headers are inferred automatically. */
    header?: string | number | AutoSizeContent;
    footer?: ReadonlyArray<string | number | AutoSizeContent>;
};

export type DOMMeasurementOptions = {
    containerRef?: React.RefObject<HTMLElement | null>;
    className?: string;
    revision?: string | number | boolean | null;
};

export type CalculateColumnWidthsArgs<TData extends unknown> = UseColumnsAutoSizeOptions & {
    tableInstance: ReturnType<typeof useTable<TData>> | null;
    columnSizing: Record<string, number>;
    columns: ColumnDef<TData>[];
    measureCellWidth: ReturnType<typeof useMeasureCellWidth>;
    measurementGeneration: number;
    sampledRows: Row<TData>[];
    previousColumnWidths: Record<string, number>;
    partial?: boolean;
};
