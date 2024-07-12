import React from 'react';

import type {ColumnPinningState} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {columnPinningDemoBlock} from './ColumnPinningDemo.classname';
import {data} from './constants/data';
import {columns} from './constants/pinning';

import './ColumnPinningDemo.scss';

export const ColumnPinningDemo = () => {
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
        <div className={columnPinningDemoBlock()}>
            <Table className={columnPinningDemoBlock('table')} table={table} />
        </div>
    );
};
