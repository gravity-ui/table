import type {ColumnDef} from '@tanstack/react-table';
import {act, renderHook} from '@testing-library/react';

import type {useTable} from '../useTable';

import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';
import {useColumnsAutoSize} from './useColumnsAutoSize';

jest.mock('./hooks/useMeasureCellWidth');
jest.mock('./utils/renderHeaderContent', () => ({renderHeaderContent: async () => 'Header'}));
jest.mock('./utils/getValueFromCell', () => ({getValueFromCell: () => 'Value'}));

type Item = {name: string};
const columns: ColumnDef<Item>[] = [{id: 'name', header: 'Name'}];
const measure = jest.fn(async () => 120);
const table = (columnSizing = {}) =>
    ({
        getRowModel: () => ({rows: [{id: 'row'}]}),
        getState: () => ({columnSizing}),
    }) as unknown as ReturnType<typeof useTable<Item>>;

beforeEach(() => {
    jest.useFakeTimers();
    measure.mockClear();
    jest.mocked(useMeasureCellWidth).mockReturnValue(measure);
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

test('restores widths before the first render, without needing rows or measurement', () => {
    const onColumnWidthsChange = jest.fn();
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            initialColumnWidths: {name: 240, removed: 100},
            onColumnWidthsChange,
            options: {measureOnce: true},
        }),
    );

    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.columnWidths).toEqual({name: 240});
    expect(result.current.columnsWithAutoSizes[0].size).toBe(240);
    expect(onColumnWidthsChange).toHaveBeenCalledWith({name: 240});
    expect(measure).not.toHaveBeenCalled();
});

test('measureOnce skips restored columns when another column is added', async () => {
    const onColumnWidthsChange = jest.fn();
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns: [...columns, {id: 'value', header: 'Value'}],
            initialColumnWidths: {name: 240},
            onColumnWidthsChange,
            options: {measureOnce: true},
        }),
    );

    expect(result.current.isMeasuring).toBe(true);
    act(() => result.current.setTableInstance(table()));
    await act(async () => {
        jest.advanceTimersByTime(100);
    });

    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.columnWidths.name).toBe(240);
    expect(result.current.columnWidths.value).toBe(144);
    expect(measure).toHaveBeenCalledTimes(2);
    expect(onColumnWidthsChange).toHaveBeenLastCalledWith({name: 240, value: 144});
});

test('restored widths are remeasured when measureOnce is disabled', async () => {
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            initialColumnWidths: {name: 240},
        }),
    );
    act(() => result.current.setTableInstance(table()));
    await act(async () => {
        jest.advanceTimersByTime(100);
    });

    expect(result.current.columnWidths.name).toBe(144);
    expect(measure).toHaveBeenCalledTimes(2);
});

test.each([0, -1, NaN, Infinity])('ignores invalid restored width %s', (width) => {
    const {result} = renderHook(() =>
        useColumnsAutoSize({columns, initialColumnWidths: {name: width}}),
    );

    expect(result.current.columnWidths).toEqual({});
    expect(result.current.isMeasuring).toBe(true);
});

test('preserves predefined and user-resized widths over restored auto widths', () => {
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns: [...columns, {id: 'fixed', size: 32}],
            initialColumnWidths: {name: 240, fixed: 80},
            options: {measureOnce: true},
        }),
    );
    act(() => result.current.setTableInstance(table({name: 360})));

    expect(result.current.columnsWithAutoSizes.map((column) => column.size)).toEqual([360, 32]);
    expect(measure).not.toHaveBeenCalled();
});

test('initial widths are read only on mount and callback identity does not trigger updates', () => {
    const first = jest.fn();
    const second = jest.fn();
    const {result, rerender} = renderHook(
        ({width, onChange}) =>
            useColumnsAutoSize({
                columns,
                initialColumnWidths: {name: width},
                onColumnWidthsChange: onChange,
            }),
        {initialProps: {width: 240, onChange: first}},
    );

    rerender({width: 500, onChange: second});

    expect(result.current.columnWidths).toEqual({name: 240});
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
});
