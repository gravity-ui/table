import React from 'react';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {cnStickyHeaderDemo} from './StickyHeaderDemo.classname';
import {columns} from './constants/columns';
import {data as originData} from './constants/data';

import './StickyHeaderDemo.scss';

const data = Array(5)
    .fill(originData)
    .flat()
    .map((val, index) => ({...val, id: `${val.id}-${index}`}));

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
