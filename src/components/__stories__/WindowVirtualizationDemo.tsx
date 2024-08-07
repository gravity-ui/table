import React from 'react';

import {useTable, useWindowRowVirtualizer} from '../../hooks';
import {Table} from '../Table';

import {cnVirtualizationDemo} from './VirtualizationDemo.classname';
import {columns} from './constants/columns';
import {generateData} from './utils';

import './VirtualizationDemo.scss';

const data = generateData(300);

export const WindowVirtualizationDemo = () => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 20,
        overscan: 5,
    });

    return (
        <Table
            table={table}
            rowVirtualizer={rowVirtualizer}
            className={cnVirtualizationDemo()}
            headerClassName={cnVirtualizationDemo('header')}
            stickyHeader
        />
    );
};
