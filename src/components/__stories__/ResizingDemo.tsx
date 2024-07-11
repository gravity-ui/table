import React from 'react';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {columns} from './constants/columns';
import {data} from './constants/data';

export const ResizingDemo = () => {
    const table = useTable({
        columns,
        data,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });

    return <Table table={table} />;
};
