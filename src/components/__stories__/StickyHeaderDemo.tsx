import React from 'react';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {cnStickyHeaderDemo} from './StickyHeaderDemo.classname';
import {columns} from './constants/columns';
import {generateData} from './utils';

import './StickyHeaderDemo.scss';

const data = generateData(30);

export const StickyHeaderDemo = () => {
    const table = useTable({
        columns,
        data,
    });

    return (
        <div className={cnStickyHeaderDemo()}>
            <Table className={cnStickyHeaderDemo('table')} table={table} stickyHeader />
        </div>
    );
};
