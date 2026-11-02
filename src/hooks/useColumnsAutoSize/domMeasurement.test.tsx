/* eslint-disable testing-library/no-node-access -- Native DOM is the measurement API under test. */
import * as React from 'react';

import type {ColumnDef} from '@tanstack/react-table';
import {act, renderHook, waitFor} from '@testing-library/react';

import {useTable} from '../useTable';

import {useMeasureCellWidth} from './hooks/useMeasureCellWidth';
import {useColumnsAutoSize} from './useColumnsAutoSize';

jest.mock('./hooks/useMeasureCellWidth');
type Item = {id: string; value: number};
const formatText = jest.fn((value: unknown, _row: Item) => String(80 + Number(value)));
const columns: ColumnDef<Item>[] = [
    {id: 'value', accessorKey: 'value', header: 'Value', meta: {autoSize: {text: formatText}}},
];
const initialData: Item[] = [{id: 'same-id', value: 1}];
const measureReact = jest.fn(async () => 120);

function useTestTable({
    data = initialData,
    defs = columns,
    revision,
    measureOnce = false,
    containerRef,
}: {
    data?: Item[];
    defs?: ColumnDef<Item>[];
    revision?: string | number | boolean | null;
    containerRef?: React.RefObject<HTMLElement | null>;
    measureOnce?: boolean;
} = {}) {
    const result = useColumnsAutoSize({
        columns: defs,
        measurementRevision: revision,
        measurementContainerRef: containerRef,
        options: {minWidth: 80, maxWidth: 500, measureOnce},
    });
    const table = useTable({
        data,
        columns: result.columnsWithAutoSizes,
        getRowId: (row) => row.id,
        enableSorting: true,
        enableColumnResizing: true,
    });
    const {setTableInstance} = result;
    React.useLayoutEffect(() => setTableInstance(table), [table, setTableInstance]);
    return {...result, table};
}

beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
        this: HTMLElement,
    ) {
        return (this.isConnected ? [{}] : []) as unknown as DOMRectList;
    });
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
        this: HTMLElement,
    ) {
        return this.getBoundingClientRect().width;
    });

    formatText.mockClear();
    measureReact.mockReset();
    measureReact.mockResolvedValue(120);
    jest.mocked(useMeasureCellWidth).mockReturnValue(measureReact);
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
    ) {
        expect(this.isConnected).toBe(true);
        return {
            width: Number(this.querySelector('.gt-table__cell span')?.textContent ?? 0),
        } as DOMRect;
    });
});
afterEach(() => jest.restoreAllMocks());

test('measures column descriptions before paint without debounce, React renderers or retained DOM', () => {
    const {result} = renderHook(() => useTestTable());
    expect(result.current.columnWidths).toEqual({value: 81});
    expect(result.current.isMeasuring).toBe(false);
    expect(formatText).toHaveBeenCalledTimes(1);
    expect(measureReact).not.toHaveBeenCalled();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
});
test('updates data with unchanged IDs and applies min/max bounds', () => {
    const {result, rerender} = renderHook(({data}) => useTestTable({data}), {
        initialProps: {data: initialData},
    });
    rerender({data: [{id: 'same-id', value: 120}]});
    expect(result.current.columnWidths.value).toBe(200);
    rerender({data: [{id: 'same-id', value: 1000}]});
    expect(result.current.columnWidths.value).toBe(500);
    rerender({data: [{id: 'same-id', value: -40}]});
    expect(result.current.columnWidths.value).toBe(80);
});
test('keeps user widths and does not remeasure other columns on resize', () => {
    const defs: ColumnDef<Item>[] = [
        ...columns,
        {id: 'other', accessorKey: 'value', meta: {autoSize: {text: formatText}}},
    ];
    const {result, rerender} = renderHook(({data}) => useTestTable({data, defs}), {
        initialProps: {data: initialData},
    });
    expect(formatText).toHaveBeenCalledTimes(2);
    act(() => result.current.table.setColumnSizing({value: 60}));
    expect(result.current.table.getColumn('value')?.getSize()).toBe(60);
    expect(formatText).toHaveBeenCalledTimes(2);
    rerender({data: [{id: 'same-id', value: 120}]});
    expect(result.current.table.getColumn('value')?.getSize()).toBe(60);
    expect(formatText).toHaveBeenCalledTimes(3);
});
test('uses the first 100 sorted rows and never measures fixed columns', () => {
    const data = Array.from({length: 150}, (_, value) => ({id: String(value), value}));
    const defs: ColumnDef<Item>[] = [...columns, {id: 'fixed', size: 32}];
    const {result} = renderHook(() => useTestTable({data, defs}));
    act(() => result.current.table.setSorting([{id: 'value', desc: true}]));
    expect(formatText.mock.calls.slice(-100).map(([, row]) => row)).toEqual(
        data.slice(50).reverse(),
    );
    expect(result.current.columnWidths.fixed).toBe(32);
});
test('measureOnce waits for data, measures new columns and refreshes on a style revision', () => {
    const {result, rerender} = renderHook((props) => useTestTable({...props, measureOnce: true}), {
        initialProps: {
            data: [] as Item[],
            defs: columns,
            revision: undefined as string | undefined,
        },
    });
    expect(formatText).not.toHaveBeenCalled();
    rerender({data: initialData, defs: columns, revision: undefined});
    rerender({data: [{id: 'same-id', value: 120}], defs: columns, revision: undefined});
    expect(result.current.columnWidths.value).toBe(81);
    expect(formatText).toHaveBeenCalledTimes(1);
    const defs: ColumnDef<Item>[] = [
        ...columns,
        {id: 'other', accessorKey: 'value', meta: {autoSize: {text: formatText}}},
    ];
    rerender({data: initialData, defs, revision: undefined});
    expect(formatText).toHaveBeenCalledTimes(2);
    rerender({data: initialData, defs, revision: 'new-theme'});
    expect(formatText).toHaveBeenCalledTimes(4);
});
test('remeasures after fonts load, including measureOnce, and removes its listener on unmount', () => {
    const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', {value: fonts, configurable: true});
    try {
        const remove = jest.spyOn(fonts, 'removeEventListener');
        const {unmount} = renderHook(() => useTestTable({measureOnce: true}));
        act(() => fonts.dispatchEvent(new Event('loadingdone')));
        expect(formatText).toHaveBeenCalledTimes(2);
        unmount();
        expect(remove).toHaveBeenCalledWith('loadingdone', expect.any(Function));
    } finally {
        if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
        else Reflect.deleteProperty(document, 'fonts');
    }
});
test('falls back to React for unsupported columns without slowing the described columns', async () => {
    const defs: ColumnDef<Item>[] = [
        ...columns,
        {id: 'unsupported', accessorKey: 'value', header: 'Unsupported'},
    ];
    const {result} = renderHook(() => useTestTable({defs}));
    await waitFor(() => expect(result.current.columnWidths.unsupported).toBe(144));
    expect(result.current.columnWidths.value).toBe(81);
    expect(measureReact).toHaveBeenCalled();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
});
test('a stale React fallback cannot overwrite a newer DOM measurement', async () => {
    let finish = (_value: number) => {};
    measureReact.mockImplementationOnce(
        () =>
            new Promise<number>((resolve) => {
                finish = resolve;
            }),
    );
    const defs: ColumnDef<Item>[] = [
        {
            ...columns[0],
            meta: {
                autoSize: {
                    text: (value) => {
                        if (value === 1) throw Error('fallback');
                        return String(80 + Number(value));
                    },
                },
            },
        },
    ];
    const {result, rerender} = renderHook(({data}) => useTestTable({data, defs}), {
        initialProps: {data: initialData},
    });
    await waitFor(() => expect(measureReact).toHaveBeenCalled());
    rerender({data: [{id: 'same-id', value: 2}]});
    expect(result.current.columnWidths.value).toBe(82);
    await act(async () => finish(999));
    expect(result.current.columnWidths.value).toBe(82);
});

test('restarts asynchronous fallback correctly under StrictMode', async () => {
    const defs: ColumnDef<Item>[] = [
        ...columns,
        {id: 'unsupported', accessorKey: 'value', header: 'Unsupported'},
    ];
    const {result} = renderHook(() => useTestTable({defs}), {wrapper: React.StrictMode});
    await waitFor(() => expect(result.current.columnWidths.unsupported).toBe(144));
    expect(result.current.columnWidths.value).toBe(81);
});

test('keeps a new described column pending until the controlled owner accepts its width', () => {
    const onChangeColumnWidths = jest.fn();
    const {result, rerender} = renderHook(
        ({defs}) => {
            const sized = useColumnsAutoSize({
                columns: defs,
                columnWidths: {value: 81},
                onChangeColumnWidths,
                options: {measureOnce: true},
            });
            const table = useTable({data: initialData, columns: sized.columnsWithAutoSizes});
            const {setTableInstance} = sized;
            React.useLayoutEffect(() => setTableInstance(table), [table, setTableInstance]);
            return sized;
        },
        {initialProps: {defs: columns}},
    );
    expect(result.current.isMeasuring).toBe(false);
    rerender({
        defs: [
            ...columns,
            {id: 'other', accessorKey: 'value', meta: {autoSize: {text: formatText}}},
        ],
    });
    expect(result.current.isMeasuring).toBe(true);
    expect(onChangeColumnWidths).toHaveBeenLastCalledWith({value: 81, other: 81});
});

test('empty data finishes loading and measureOnce still measures the first data', () => {
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
        this: HTMLElement,
    ) {
        return Number(this.querySelector('.gt-table__cell span')?.textContent ?? 100);
    });
    const {result, rerender} = renderHook(({data}) => useTestTable({data, measureOnce: true}), {
        initialProps: {data: [] as Item[]},
    });
    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.columnWidths.value).toBe(100);
    rerender({data: [{id: 'same-id', value: 120}]});
    expect(result.current.columnWidths.value).toBe(200);
});

test('resetting resize restores auto sizing for the latest data, also with measureOnce', () => {
    const {result, rerender} = renderHook(({data}) => useTestTable({data, measureOnce: true}), {
        initialProps: {data: initialData},
    });
    act(() => result.current.table.setColumnSizing({value: 200}));
    rerender({data: [{id: 'same-id', value: 120}]});
    expect(result.current.columnWidths.value).toBe(81);
    act(() => result.current.table.resetColumnSizing());
    expect(result.current.columnWidths.value).toBe(200);
    expect(result.current.table.getColumn('value')?.getSize()).toBe(200);
});

test('equivalent fresh arrays and controlled widths do not trigger measurements', () => {
    const {rerender} = renderHook(
        ({tick: _tick}) => {
            const sized = useColumnsAutoSize({
                columns: columns.map((c) => ({...c})),
                columnWidths: {value: 81},
                onChangeColumnWidths: () => {},
            });
            const table = useTable({data: initialData, columns: sized.columnsWithAutoSizes});
            const {setTableInstance} = sized;
            React.useLayoutEffect(() => setTableInstance(table), [table, setTableInstance]);
            return sized;
        },
        {initialProps: {tick: 0}},
    );
    const count = formatText.mock.calls.length;
    rerender({tick: 1});
    rerender({tick: 2});
    expect(formatText).toHaveBeenCalledTimes(count);
});

test('leaf descriptions work inside grouped columns', () => {
    const defs: ColumnDef<Item>[] = [{id: 'group', header: 'Group', columns}];
    const {result} = renderHook(() => useTestTable({defs}));
    expect(result.current.columnWidths.value).toBe(81);
});

test('mixed-column React fallback remains debounced while DOM descriptions update immediately', async () => {
    const defs: ColumnDef<Item>[] = [
        ...columns,
        {id: 'fallback', accessorKey: 'value', header: 'Fallback'},
    ];
    const {result, rerender} = renderHook(({data}) => useTestTable({defs, data}), {
        initialProps: {data: initialData},
    });
    rerender({data: [{id: 'same-id', value: 2}]});
    rerender({data: [{id: 'same-id', value: 3}]});
    expect(result.current.columnWidths.value).toBe(83);
    expect(measureReact).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.columnWidths.fallback).toBe(144));
    expect(measureReact).toHaveBeenCalledTimes(2);
});

test('a hidden measureOnce table retries on visibility and never freezes minWidth', () => {
    let retry = () => {};
    const original = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
    Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        value: class {
            constructor(callback: () => void) {
                retry = callback;
            }
            observe() {}
            disconnect() {}
        },
    });
    const container = document.createElement('div');
    document.body.append(container);
    let visible = false;
    jest.spyOn(container, 'getClientRects').mockImplementation(
        () => (visible ? [{}] : []) as unknown as DOMRectList,
    );
    try {
        const {result, unmount} = renderHook(() =>
            useTestTable({measureOnce: true, containerRef: {current: container}}),
        );
        expect(result.current.columnWidths.value).toBeUndefined();
        visible = true;
        act(() => retry());
        expect(result.current.columnWidths.value).toBe(81);
        expect(result.current.isMeasuring).toBe(false);
        unmount();
    } finally {
        container.remove();
        if (original) Object.defineProperty(globalThis, 'ResizeObserver', original);
        else Reflect.deleteProperty(globalThis, 'ResizeObserver');
    }
});

test('resize ticks do not force another owner render', () => {
    const rendered = jest.fn();
    const {result} = renderHook(() => {
        rendered();
        return useTestTable();
    });
    act(() => result.current.table.setColumnSizing({value: 200}));
    const before = rendered.mock.calls.length;
    act(() => result.current.table.setColumnSizing({value: 210}));
    expect(rendered.mock.calls.length - before).toBe(1);
});

test('inline cell callbacks and React header owners are excluded from the measurement key', () => {
    const makeDefs = (): ColumnDef<Item>[] => {
        const header = {$$typeof: Symbol.for('react.element'), type: 'span', props: {}};
        Object.defineProperty(header, '_owner', {
            enumerable: true,
            get() {
                throw Error('Fiber must not be visited');
            },
        });
        return [
            {
                ...columns[0],
                cell: () => null,
                header: header as unknown as string,
                meta: {autoSize: {text: formatText, header: 'Value'}},
            },
        ];
    };
    const {rerender} = renderHook(({tick: _tick}) => useTestTable({defs: makeDefs()}), {
        initialProps: {tick: 0},
    });
    const calls = formatText.mock.calls.length;
    rerender({tick: 1});
    rerender({tick: 2});
    expect(formatText).toHaveBeenCalledTimes(calls);
});
