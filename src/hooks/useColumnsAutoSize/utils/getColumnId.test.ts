import type {Row} from '@tanstack/react-table';

import {getColumnId} from './getColumnId';
import {getValueFromCell} from './getValueFromCell';
import {getDefinedWidth, hasDefinedWidth} from './hasDefinedWidth';

test('resolved IDs match TanStack, including explicit dotted IDs', () => {
    expect(getColumnId({accessorKey: 'a.b'})).toBe('a_b');
    expect(getColumnId({id: 'a.b', accessorKey: 'a.b'})).toBe('a.b');
    expect(getColumnId({header: 'Name'})).toBe('Name');
});
test('only an explicit size or equal numeric bounds define a fixed width', () => {
    expect(getDefinedWidth({id: 'value', size: 120})).toBe(120);
    expect(getDefinedWidth({id: 'value', minSize: 100, maxSize: 100})).toBe(100);
    expect(hasDefinedWidth({id: 'value', maxSize: 200})).toBe(false);
    expect(getDefinedWidth({id: 'value', minSize: 10, maxSize: 200})).toBeUndefined();
});
test('React fallback resolves nested accessors using the same ID', () => {
    const getValue = jest.fn(() => 42);
    expect(
        getValueFromCell(null, {accessorKey: 'a.b'}, {
            original: {a: {b: 42}},
            getValue,
        } as unknown as Row<{a: {b: number}}>),
    ).toBe(42);
    expect(getValue).toHaveBeenCalledWith('a_b');
});
