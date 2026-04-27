// src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
import type {ColumnDef} from '@tanstack/react-table';
import {render} from '@testing-library/react';

import {useTable} from '../../../hooks';
import {Table} from '../../Table';

interface Item {
    id: string;
    name: string;
}

const cellRenderCount = new Map<string, number>();

const NameCell = ({id, value}: {id: string; value: string}) => {
    cellRenderCount.set(id, (cellRenderCount.get(id) ?? 0) + 1);
    return <span>{value}</span>;
};

const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        cell: (info) => <NameCell id={info.row.id} value={info.getValue<string>()} />,
    },
];

const data: Item[] = [
    {id: 'a', name: 'A'},
    {id: 'b', name: 'B'},
    {id: 'c', name: 'C'},
];

const getRowId = (row: Item) => row.id;

describe('MemoBaseRow + MemoBaseCell wiring', () => {
    beforeEach(() => {
        cellRenderCount.clear();
    });

    it('does not re-run the cell renderer when only the row className changes', () => {
        const Wrapper = ({className}: {className: string}) => {
            const table = useTable({columns, data, getRowId});
            return <Table table={table} rowClassName={className} experimentalMemoization />;
        };

        const {rerender} = render(<Wrapper className="v1" />);

        // Baseline: every cell rendered exactly once.
        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(1);
        expect(cellRenderCount.get('c')).toBe(1);

        // Force a row-level re-render by changing the className. cell objects from
        // tanstack are stable across this re-render, so MemoBaseCell should skip.
        rerender(<Wrapper className="v2" />);

        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(1);
        expect(cellRenderCount.get('c')).toBe(1);
    });
});
