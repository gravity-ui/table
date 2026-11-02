import type * as React from 'react';

import type {ColumnDef, Row} from '@tanstack/react-table';

import {createDOMMeasureElementFactory} from './createDOMMeasureElement';
import {measureDOMColumns} from './measureDOMColumns';
afterEach(() => jest.restoreAllMocks());
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
});

test('inserts all columns before a single width read per column, inherits context and cleans up', () => {
    const container = document.createElement('section');
    document.body.append(container);
    const columns: ColumnDef<unknown>[] = [
        {id: 'one', meta: {autoSize: {}}},
        {id: 'two', meta: {autoSize: {}}},
    ];
    const read = jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(function (this: HTMLElement) {
            expect(this.parentElement?.parentElement).toBe(container);
            expect(this.parentElement?.children).toHaveLength(2);
            expect(this.parentElement?.getAttribute('aria-hidden')).toBe('true');
            return {width: 123.25} as DOMRect;
        });
    expect(
        measureDOMColumns({
            columns,
            rows: [],
            measurement: {containerRef: {current: container}},
            options: {},
        }),
    ).toEqual({one: 124, two: 124});
    expect(read).toHaveBeenCalledTimes(2);
    expect(container.children).toHaveLength(0);
    container.remove();
});
test('isolates broken text formatters and includes headers, footers and reserved control width', () => {
    const rows = [{original: {}, getValue: () => 42}] as unknown as Row<unknown>[];
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
    ) {
        expect(this.querySelector('.gt-table__header-cell')?.textContent).toBe('Header');
        expect(this.querySelector('.gt-table__footer-cell')?.textContent).toBe('Total: 42');
        expect(this.querySelector('.gt-table__cell')?.children).toHaveLength(2);
        return {width: 100} as DOMRect;
    });
    expect(
        measureDOMColumns({
            columns: [
                {
                    id: 'broken',
                    meta: {
                        autoSize: {
                            text: () => {
                                throw Error('broken');
                            },
                        },
                    },
                },
                {
                    id: 'healthy',
                    header: 'Header',
                    meta: {autoSize: {extraWidth: 24, footer: ['Total: 42']}},
                },
            ],
            rows,
            measurement: {},
            options: {},
        }),
    ).toEqual({healthy: 100});
});
test('the DOM factory preserves text and React numeric style semantics', () => {
    const createElement = createDOMMeasureElementFactory(document);
    const element = createElement('span', {
        textContent: '<text> & 0',
        style: {
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 2,
            lineHeight: 1.5,
            padding: 0,
            flexShrink: 0,
            '--size': 20,
        } as React.CSSProperties,
    });
    expect(element.textContent).toBe('<text> & 0');
    expect(element.children).toHaveLength(0);
    expect(element.style.fontSize).toBe('18px');
    expect(element.style.fontWeight).toBe('700');
    expect(element.style.letterSpacing).toBe('2px');
    expect(element.style.lineHeight).toBe('1.5');
    expect(element.style.getPropertyValue('--size')).toBe('20');
});

test('detached, hidden and zero-width containers defer instead of accepting minWidth', () => {
    const columns: ColumnDef<unknown>[] = [{id: 'a', header: 'A', meta: {autoSize: {}}}];
    const container = document.createElement('div');
    expect(
        measureDOMColumns({
            columns,
            rows: [],
            measurement: {containerRef: {current: container}},
            options: {},
        }),
    ).toBeUndefined();
    document.body.append(container);
    jest.spyOn(container, 'getClientRects').mockReturnValue([] as unknown as DOMRectList);
    expect(
        measureDOMColumns({
            columns,
            rows: [],
            measurement: {containerRef: {current: container}},
            options: {},
        }),
    ).toBeUndefined();
    expect(container.children).toHaveLength(0);
    container.remove();
});

test('uses untransformed layout width and preserves function-based extra space', () => {
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(160);
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 80,
    } as DOMRect);
    const extra = jest.fn((value: unknown) => Number(value));
    const rows = [{original: {}, getValue: () => 24}] as unknown as Row<unknown>[];
    const widths = measureDOMColumns({
        columns: [{id: 'a', meta: {autoSize: {extraWidth: extra}}}],
        rows,
        measurement: {},
        options: {},
    });
    expect(widths).toEqual({a: 160});
    expect(extra).toHaveBeenCalledWith(24, {});
});

test('zero-width columns defer independently and meta.header works without column.header', () => {
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
        this: HTMLElement,
    ) {
        return this.textContent?.includes('Hidden') ? 0 : 120;
    });
    const deferred = new Set<string>();
    expect(
        measureDOMColumns({
            columns: [
                {id: 'a', meta: {autoSize: {header: 'Hidden'}}},
                {id: 'b', meta: {autoSize: {header: 'Visible'}}},
            ],
            rows: [],
            measurement: {},
            options: {},
            deferredColumnIds: deferred,
        }),
    ).toEqual({b: 120});
    expect([...deferred]).toEqual(['a']);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
});

test('formatter fallback does not require a process global', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
    let widths: Record<string, number> | undefined;
    try {
        Object.defineProperty(globalThis, 'process', {value: undefined, configurable: true});
        widths = measureDOMColumns({
            columns: [
                {
                    id: 'x',
                    meta: {
                        autoSize: {
                            text: () => {
                                throw Error('broken');
                            },
                        },
                    },
                },
            ],
            rows: [{original: {}, getValue: () => 1}] as unknown as Row<unknown>[],
            measurement: {},
            options: {},
        });
    } finally {
        if (descriptor) Object.defineProperty(globalThis, 'process', descriptor);
    }
    expect(widths).toEqual({});
});
