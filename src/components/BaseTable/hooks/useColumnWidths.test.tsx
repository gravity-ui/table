/* eslint-disable testing-library/no-node-access -- Verify native track measurements and style restoration. */
import * as React from 'react';

import {act, fireEvent, render, screen} from '@testing-library/react';

import {useTable} from '../../../hooks/useTable';
import type {ColumnDef} from '../../../types/base';
import {BaseTable} from '../BaseTable';

const columns: ColumnDef<{value: string}>[] = [
    {accessorKey: 'value', header: 'Value', width: 'max-content', minSize: 50},
];
let intrinsicWidth = 100;
const readWidth = jest.fn();
let table: ReturnType<typeof useTable<{value: string}>>;
function Example({
    value = 'short',
    controlled = false,
    empty = false,
}: {
    value?: string;
    controlled?: boolean;
    empty?: boolean;
}) {
    const data = React.useMemo(() => (empty ? [] : [{value}]), [value, empty]);
    table = useTable({
        columns,
        data,
        enableColumnResizing: true,
        ...(controlled ? {state: {columnSizing: {}}} : {}),
    });
    return <BaseTable table={table} />;
}
beforeEach(() => {
    intrinsicWidth = 100;
    readWidth.mockClear();
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
        this: HTMLElement,
    ) {
        return this.getBoundingClientRect().width;
    });
    jest.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
        this: HTMLElement,
    ) {
        return (this.isConnected ? [{}] : []) as unknown as DOMRectList;
    });
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
    ) {
        if (this.dataset.measuringCellKey) {
            readWidth();
            const liveTable = this.ownerDocument.querySelector(
                'table:not([aria-hidden])',
            ) as HTMLElement;
            expect(liveTable.style.display).not.toBe('grid');
            expect(this.closest('table')?.getAttribute('aria-hidden')).toBe('true');
        }
        return {width: this.dataset.measuringCellKey ? intrinsicWidth : 600} as DOMRect;
    });
});
afterEach(() => jest.restoreAllMocks());

test('caches measured tracks across data updates and restores live table styles', () => {
    const {rerender} = render(<Example />);
    const cell = screen.getByRole('cell');
    const previousColumns = table.getAllLeafColumns();
    expect(cell.style.width).toBe('100px');
    intrinsicWidth = 250;
    rerender(<Example value="longer content" />);
    expect(table.getAllLeafColumns()).toBe(previousColumns);
    expect(cell.style.width).toBe('100px');
    expect(cell.style.gridColumn).toBe('');
    expect(screen.getByRole('table').style.display).toBe('');
    const probes = screen.getByRole('table').querySelectorAll('[data-measuring-cell-key]');
    expect(probes).toHaveLength(0);
});
test('keeps manually resized widths and double click stores a new max-content width', () => {
    render(<Example />);
    act(() => table.setColumnSizing({value: 180}));
    expect(screen.getByRole('cell').style.width).toBe('180px');
    intrinsicWidth = 220;
    const handle = screen.getByRole('columnheader').querySelector('[class*="resize-handle"]');
    expect(handle).not.toBeNull();
    fireEvent.doubleClick(handle as Element);
    expect(screen.getByRole('cell').style.width).toBe('220px');
    expect(table.getState().columnSizing.value).toBe(220);
});

test('does not remeasure when a controlled owner recreates equivalent sizing state', () => {
    const {rerender} = render(<Example controlled />);
    const before = readWidth.mock.calls.length;
    rerender(<Example controlled value="updated" />);
    expect(readWidth).toHaveBeenCalledTimes(before);
});

test('replaces header-only widths when the first rows arrive', () => {
    const {rerender} = render(<Example empty />);
    expect(table.getColumn('value')?.getSize()).toBe(100);
    intrinsicWidth = 250;
    rerender(<Example />);
    expect(table.getColumn('value')?.getSize()).toBe(250);
});

test('resetting a manual width measures current content', () => {
    render(<Example />);
    act(() => table.setColumnSizing({value: 180}));
    intrinsicWidth = 250;
    act(() => table.setColumnSizing({}));
    expect(table.getColumn('value')?.getSize()).toBe(250);
});

test('font loading refreshes native widths', () => {
    const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    const fonts = Object.assign(new EventTarget(), {status: 'loaded', ready: Promise.resolve()});
    Object.defineProperty(document, 'fonts', {configurable: true, value: fonts});
    try {
        const {unmount} = render(<Example />);
        intrinsicWidth = 250;
        act(() => fonts.dispatchEvent(new Event('loadingdone')));
        expect(table.getColumn('value')?.getSize()).toBe(250);
        unmount();
    } finally {
        if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
        else Reflect.deleteProperty(document, 'fonts');
    }
});
