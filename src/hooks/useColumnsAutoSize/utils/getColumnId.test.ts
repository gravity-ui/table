import type {ColumnDef, Row} from '@tanstack/react-table';

import {getColumnId} from './getColumnId';
import {getValueFromCell} from './getValueFromCell';
import {setColumnAutoSizes} from './setColumnAutoSizes';

test('legacy IDs retain dotted keys, empty-ID fallback and ignore headers', () => {
    expect(getColumnId({accessorKey: 'a.b'})).toBe('a.b');
    expect(getColumnId({id: '', accessorKey: 'a.b'})).toBe('a.b');
    expect(getColumnId({header: 'Name'})).toBe('');
    expect(
        getColumnId({accessorKey: 'a.b', meta: {autoSize: {}} as ColumnDef<unknown>['meta']}),
    ).toBe('a_b');
    expect(getColumnId({header: 'Name', meta: {autoSize: {}} as ColumnDef<unknown>['meta']})).toBe(
        'Name',
    );
});
test('legacy cells read literal keys and invoke accessors with index zero', () => {
    const original = {'a.b': 7, a: {b: 42}};
    const getValue = jest.fn(() => 99);
    const row = {original, index: 5, getValue} as unknown as Row<typeof original>;
    expect(getValueFromCell(null, {accessorKey: 'a.b'}, row)).toBe(7);
    const accessorFn = jest.fn((_value, index) => index);
    expect(getValueFromCell(null, {id: 'v', accessorFn}, row)).toBe(0);
    expect(getValue).not.toHaveBeenCalled();
    expect(accessorFn).toHaveBeenCalledWith(original, 0);
});
test('legacy groups remain untouched unless recursive sizing is enabled', () => {
    const columns = [{id: 'group', columns: [{accessorKey: 'a.b'}]}];
    expect(setColumnAutoSizes(columns, {'a.b': 120}, {})).toEqual(columns);
    expect(setColumnAutoSizes(columns, {'a.b': 120}, {}, true, true)[0]).toEqual({
        id: 'group',
        columns: [{accessorKey: 'a.b', size: 120, minSize: 120}],
    });
});
