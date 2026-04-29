// src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
import type {ColumnDef, Row} from '@tanstack/react-table';
import {act, render} from '@testing-library/react';

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

    it('re-renders only the toggled row when row.getIsSelected changes (default getRowVersion)', () => {
        // Capture the table instance so the test can drive state through TanStack
        // without rendering UI controls.
        const tableRef: {current: ReturnType<typeof useTable<Item>> | null} = {current: null};

        const Wrapper = () => {
            const table = useTable({columns, data, getRowId, enableRowSelection: true});
            tableRef.current = table;
            return <Table table={table} experimentalMemoization />;
        };

        render(<Wrapper />);

        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(1);
        expect(cellRenderCount.get('c')).toBe(1);

        // Toggle selection of row b. TanStack updates internal state and triggers
        // a re-render of `Wrapper` (the component using useTable). The default
        // getRowVersion includes getIsSelected, so b's row+cell version changes.
        act(() => {
            tableRef.current!.getRow('b').toggleSelected();
        });

        // a and c: row reference unchanged + version unchanged → memo skips → cell skipped.
        // b: version changed → row re-renders → cell re-renders.
        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(2);
        expect(cellRenderCount.get('c')).toBe(1);
    });

    it('re-renders only the row whose custom version slice changed', () => {
        // Custom external state keyed by row id, not on the row itself.
        const flagged = new Map<string, boolean>([
            ['a', false],
            ['b', false],
            ['c', false],
        ]);

        const getRowVersion = (row: Row<Item>) => [flagged.get(row.id) ?? false] as const;

        const Wrapper = ({forceRerender: _}: {forceRerender: number}) => {
            const table = useTable({columns, data, getRowId});
            return <Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
        };

        const {rerender} = render(<Wrapper forceRerender={0} />);

        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(1);
        expect(cellRenderCount.get('c')).toBe(1);

        // Mutate the external map for row b only, then force a parent re-render
        // by changing the unrelated `forceRerender` prop.
        flagged.set('b', true);
        rerender(<Wrapper forceRerender={1} />);

        // a and c had unchanged versions ([false]) — skipped.
        // b's version changed ([false] -> [true]) — re-rendered.
        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(2);
        expect(cellRenderCount.get('c')).toBe(1);
    });

    it('detects length changes in getRowVersion as a state change', () => {
        let extended = false;
        const getRowVersion = (row: Row<Item>) =>
            extended ? ([row.id, 'extra'] as readonly unknown[]) : ([row.id] as readonly unknown[]);

        const Wrapper = ({forceRerender: _}: {forceRerender: number}) => {
            const table = useTable({columns, data, getRowId});
            return <Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
        };

        const {rerender} = render(<Wrapper forceRerender={0} />);

        expect(cellRenderCount.get('a')).toBe(1);
        expect(cellRenderCount.get('b')).toBe(1);
        expect(cellRenderCount.get('c')).toBe(1);

        // Switch to the longer-array variant. arraysShallowEqual sees a length
        // mismatch and treats every row as changed.
        extended = true;
        rerender(<Wrapper forceRerender={1} />);

        expect(cellRenderCount.get('a')).toBe(2);
        expect(cellRenderCount.get('b')).toBe(2);
        expect(cellRenderCount.get('c')).toBe(2);
    });
});
