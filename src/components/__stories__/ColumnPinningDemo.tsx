import React from 'react';

import type {ColumnPinningState} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';

import {cnColumnPinningDemo} from './ColumnPinningDemo.classname';
import {columns} from './constants/columnPinning';
import {data} from './constants/data';

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
        <div className={cnColumnPinningDemo()}>
            <BaseTable className={cnColumnPinningDemo('table')} table={table} />
        </div>
    );
};
