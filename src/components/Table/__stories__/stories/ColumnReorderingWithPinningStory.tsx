import * as React from 'react';

import type {ColumnOrderState, ColumnPinningState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/base';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {ColumnReorderingProvider} from '../../../ColumnReorderingProvider';
import {Table} from '../../index';
import type {TableProps} from '../../index';

import {cnTableColumnReorderingWithPinningStory} from './ColumnReorderingWithPinningStory.classname';

import './ColumnReorderingWithPinningStory.scss';

interface Item {
    id: string;
    name: string;
    age: number;
    status: string;
}

const column = (def: ColumnDef<Item> & {size: number}): ColumnDef<Item> => ({
    ...def,
    minSize: def.size,
    maxSize: def.size,
});

const columns: ColumnDef<Item>[] = [
    column({accessorKey: 'name', header: 'Name', size: 120}),
    column({accessorKey: 'age', header: 'Age', size: 110}),
    column({accessorKey: 'status', header: 'Status', size: 150}),
    column({
        id: 'name-age',
        accessorFn: (item) => `${item.name}: ${item.age}`,
        header: 'Name + age',
        size: 160,
    }),
    column({
        id: 'name-upper',
        accessorFn: (item) => item.name.toUpperCase(),
        header: 'Name upper',
        size: 170,
    }),
    column({
        id: 'age-x2',
        accessorFn: (item) => `${item.age * 2}`,
        header: 'Age × 2',
        size: 130,
    }),
    column({
        id: 'status-copy',
        accessorFn: (item) => item.status,
        header: 'Status copy',
        size: 160,
    }),
    column({
        id: 'name-status',
        accessorFn: (item) => `${item.name} (${item.status})`,
        header: 'Name + status',
        size: 150,
    }),
    column({
        id: 'age-status',
        accessorFn: (item) => `${item.age} / ${item.status}`,
        header: 'Age + status',
        size: 150,
    }),
];

const data = generateData(30) as Item[];

export const ColumnReorderingWithPinningStory = (props: Omit<TableProps<Item>, 'table'>) => {
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: ['name', 'age'],
        right: ['name-status', 'age-status'],
    });
    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
        enableColumnPinning: true,
        onColumnPinningChange: setColumnPinning,
        onColumnOrderChange: setColumnOrder,
        state: {columnPinning, columnOrder},
    });

    return (
        <div className={cnTableColumnReorderingWithPinningStory()}>
            <div className={cnTableColumnReorderingWithPinningStory('hint')}>
                Drag the left pinned pair (Name / Age), the right pinned pair (Name + status / Age +
                status), or the center pair (Status / Name + age) to reorder within each group.
            </div>
            <ColumnReorderingProvider
                table={table}
                onReorder={(result) => {
                    if (result.pinned) {
                        setColumnPinning(result.columnPinning);
                    } else {
                        setColumnOrder(result.columnOrder);
                    }
                }}
            >
                <div className={cnTableColumnReorderingWithPinningStory('scroll')}>
                    <Table table={table} {...props} />
                </div>
            </ColumnReorderingProvider>
        </div>
    );
};
