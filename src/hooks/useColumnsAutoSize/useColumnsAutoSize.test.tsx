import * as React from 'react';

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

test('uses controlled widths immediately without rows, measurements, or mount callbacks', () => {
    const onChangeColumnWidths = jest.fn();
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            columnWidths: {name: 240},
            onChangeColumnWidths,
            options: {measureOnce: true},
        }),
    );
    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.columnWidths).toEqual({name: 240});
    expect(result.current.columnsWithAutoSizes[0].size).toBe(240);
    expect(onChangeColumnWidths).not.toHaveBeenCalled();
    expect(measure).not.toHaveBeenCalled();
});

test('applies new controlled props after mount even with measureOnce', () => {
    const onChangeColumnWidths = jest.fn();
    const {result, rerender} = renderHook(
        ({width}) =>
            useColumnsAutoSize({
                columns,
                columnWidths: {name: width},
                onChangeColumnWidths,
                options: {measureOnce: true},
            }),
        {initialProps: {width: 240}},
    );
    rerender({width: 500});
    expect(result.current.columnsWithAutoSizes[0].size).toBe(500);
    expect(onChangeColumnWidths).not.toHaveBeenCalled();
});

test('updates internal widths and notifies the callback in uncontrolled mode', async () => {
    const onChangeColumnWidths = jest.fn();
    const {result} = renderHook(() => useColumnsAutoSize({columns, onChangeColumnWidths}));
    act(() => result.current.setTableInstance(table()));
    await act(async () => {
        jest.advanceTimersByTime(100);
    });
    expect(result.current.columnWidths).toEqual({name: 144});
    expect(onChangeColumnWidths).toHaveBeenCalledTimes(1);
    expect(onChangeColumnWidths).toHaveBeenCalledWith({name: 144});
});

test('requests controlled changes without replacing the supplied widths internally', async () => {
    const onChangeColumnWidths = jest.fn();
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            columnWidths: {name: 240},
            onChangeColumnWidths,
        }),
    );
    act(() => result.current.setTableInstance(table()));
    await act(async () => {
        jest.advanceTimersByTime(100);
    });
    expect(onChangeColumnWidths).toHaveBeenLastCalledWith({name: 144});
    expect(result.current.columnWidths).toEqual({name: 240});
    expect(result.current.columnsWithAutoSizes[0].size).toBe(240);
});

test('measureOnce only measures missing columns and accepts the owner update', async () => {
    const {result} = renderHook(() => {
        const [columnWidths, onChangeColumnWidths] = React.useState<Record<string, number>>({
            name: 240,
        });
        return useColumnsAutoSize({
            columns: [...columns, {id: 'value', header: 'Value'}],
            columnWidths,
            onChangeColumnWidths,
            options: {measureOnce: true},
        });
    });
    expect(result.current.isMeasuring).toBe(true);
    act(() => result.current.setTableInstance(table()));
    await act(async () => {
        jest.advanceTimersByTime(100);
    });
    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.columnWidths).toEqual({name: 240, value: 144});
    expect(measure).toHaveBeenCalledTimes(2);
});

test.each([0, -1, NaN, Infinity])('ignores invalid controlled width %s', (width) => {
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            columnWidths: {name: width},
            onChangeColumnWidths: jest.fn(),
        }),
    );
    expect(result.current.columnWidths).toEqual({});
    expect(result.current.isMeasuring).toBe(true);
});

test('removes obsolete widths and notifies the owner', () => {
    const onChangeColumnWidths = jest.fn();
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns,
            columnWidths: {name: 240, removed: 80},
            onChangeColumnWidths,
        }),
    );
    expect(result.current.columnWidths).toEqual({name: 240});
    expect(onChangeColumnWidths).toHaveBeenCalledWith({name: 240});
});

test('preserves predefined and user-resized widths over controlled auto widths', () => {
    const {result} = renderHook(() =>
        useColumnsAutoSize({
            columns: [...columns, {id: 'fixed', size: 32}],
            columnWidths: {name: 240, fixed: 80},
            onChangeColumnWidths: jest.fn(),
            options: {measureOnce: true},
        }),
    );
    act(() => result.current.setTableInstance(table({name: 360})));
    expect(result.current.columnsWithAutoSizes.map((column) => column.size)).toEqual([360, 32]);
    expect(measure).not.toHaveBeenCalled();
});

test('pending measurement uses the latest callback', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const {result, rerender} = renderHook(
        ({onChange}) =>
            useColumnsAutoSize({
                columns,
                onChangeColumnWidths: onChange,
            }),
        {initialProps: {onChange: first}},
    );
    act(() => result.current.setTableInstance(table()));
    rerender({onChange: second});
    await act(async () => {
        jest.advanceTimersByTime(100);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({name: 144});
});

test('clearing controlled widths allows measureOnce to measure them again', async () => {
    const onChangeColumnWidths = jest.fn();
    const {result, rerender} = renderHook(
        ({columnWidths}) =>
            useColumnsAutoSize({
                columns,
                columnWidths,
                onChangeColumnWidths,
                options: {measureOnce: true},
            }),
        {initialProps: {columnWidths: {name: 240} as Record<string, number>}},
    );
    act(() => result.current.setTableInstance(table()));
    rerender({columnWidths: {}});
    await act(async () => {
        jest.advanceTimersByTime(100);
    });
    expect(onChangeColumnWidths).toHaveBeenCalledWith({name: 144});
    expect(measure).toHaveBeenCalledTimes(2);
});
