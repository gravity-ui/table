import React from 'react';

import type {ColumnDef, ColumnPinningState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {ColumnPinningHeaderCell} from '../cells/ColumnPinningHeaderCell';
import {data} from '../constants/data';
import type {Item} from '../types';

import {cnColumnPinningStory} from './ColumnPinningStory.classname';

import './ColumnPinningStory.scss';

const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: (info) => <ColumnPinningHeaderCell value="Name" info={info} />,
        minSize: 200,
    },
    {
        accessorKey: 'age',
        header: (info) => <ColumnPinningHeaderCell value="Age" info={info} />,
        minSize: 200,
    },
    {
        accessorKey: 'status',
        header: (info) => <ColumnPinningHeaderCell value="Status" info={info} />,
        minSize: 300,
    },
];

export const ColumnPinningStory = () => {
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [],
        right: [],
    });

    const table = useTable({
        columns,
        data,
        enableColumnPinning: true,
        onColumnPinningChange: setColumnPinning,
        state: {
            columnPinning,
        },
    });

    return (
        <div className={cnColumnPinningStory()}>
            <BaseTable className={cnColumnPinningStory('table')} table={table} />
        </div>
    );
};
