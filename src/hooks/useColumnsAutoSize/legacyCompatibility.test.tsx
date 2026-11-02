import type {ColumnDef, Row} from '@tanstack/react-table';
import {act, renderHook} from '@testing-library/react';

import type {useTable} from '../useTable';

import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';
import {useColumnsAutoSize} from './useColumnsAutoSize';
jest.mock('./hooks/useMeasureCellWidth');

test('legacy hook preserves dotted keys, group boundaries, accessor index and measureOnce', async () => {
    jest.useFakeTimers();
    try {
        const measure = jest.fn(async (value) => Number(value));
        jest.mocked(useMeasureCellWidth).mockReturnValue(measure);
        const accessorFn = jest.fn((_row, index) => 90 + index);
        const columns: ColumnDef<{'a.b': number}>[] = [
            {accessorKey: 'a.b'},
            {id: 'fn', accessorFn},
            {id: 'group', columns: [{accessorKey: 'a.b'}]},
        ];
        const row = {id: 'row', index: 8, original: {'a.b': 70}} as Row<{'a.b': number}>;
        const table = {
            getRowModel: () => ({rows: [row]}),
            getState: () => ({columnSizing: {}}),
        } as unknown as ReturnType<typeof useTable<{'a.b': number}>>;
        const {result, rerender} = renderHook(() =>
            useColumnsAutoSize({columns, options: {measureOnce: true, measureHeaderText: false}}),
        );
        expect(result.current.isMeasuring).toBe(true);
        act(() => result.current.setTableInstance(table));
        await act(async () => {
            jest.advanceTimersByTime(100);
        });
        expect(result.current.columnWidths).toEqual({'a.b': 86, fn: 106, group: 150});
        expect(result.current.columnsWithAutoSizes).toEqual([
            {...columns[0], size: 86, minSize: 86},
            {...columns[1], size: 106, minSize: 106},
            {...columns[2], size: 150, minSize: 150},
        ]);
        expect(result.current.isMeasuring).toBe(false);
        expect(accessorFn).toHaveBeenCalledWith(row.original, 0);
        const calls = measure.mock.calls.length;
        row.original['a.b'] = 200;
        rerender();
        await act(async () => {
            jest.advanceTimersByTime(100);
        });
        expect(measure).toHaveBeenCalledTimes(calls);
        expect(result.current.columnWidths['a.b']).toBe(86);
    } finally {
        jest.clearAllTimers();
        jest.useRealTimers();
    }
});
