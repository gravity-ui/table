import React from 'react';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {cnStickyHeaderDemo} from './StickyHeaderDemo.classname';
import {columns} from './constants/columns';
import {data} from './constants/data';

import './StickyHeaderDemo.scss';

export const StickyHeaderDemo = () => {
    const table = useTable({
        columns,
        data: Array(5)
            .fill(data)
            .flat()
            .map((val, index) => ({...val, id: `${val.id}-${index}`})),
    });

    return (
        <div className={cnStickyHeaderDemo()}>
            <Table className={cnStickyHeaderDemo('table')} table={table} stickyHeader={true} />
        </div>
    );
};
