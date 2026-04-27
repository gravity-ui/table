import type {ColumnDef} from '@tanstack/react-table';
import {render} from '@testing-library/react';

import {useTable} from '../../../hooks';
import {Table} from '../../Table';

interface Item {
    id: string;
    name: string;
}

const data: Item[] = [{id: 'a', name: 'A'}];
const columns: ColumnDef<Item>[] = [{accessorKey: 'name'}];

describe('BaseTable + experimentalMemoization stability warnings', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    function Wrapper({version, memoize}: {version: number; memoize: boolean}) {
        const table = useTable({columns, data, getRowId: (row) => row.id});
        // Inline rowAttributes — fresh ref every render.
        const rowAttributes = (_row: any) => ({'aria-label': String(version)});
        return (
            <Table table={table} rowAttributes={rowAttributes} experimentalMemoization={memoize} />
        );
    }

    it('warns once when rowAttributes changes ref under experimentalMemoization', () => {
        const {rerender} = render(<Wrapper version={1} memoize />);
        rerender(<Wrapper version={2} memoize />);
        rerender(<Wrapper version={3} memoize />);

        const rowAttributesWarnings = warnSpy.mock.calls.filter((call) =>
            String(call[0]).includes('`rowAttributes`'),
        );
        expect(rowAttributesWarnings).toHaveLength(1);
    });

    it('does not warn when experimentalMemoization is off', () => {
        const {rerender} = render(<Wrapper version={1} memoize={false} />);
        rerender(<Wrapper version={2} memoize={false} />);

        expect(warnSpy).not.toHaveBeenCalled();
    });
});
