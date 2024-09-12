import React from 'react';

import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../index';

const data = generateData(300);

export const WindowVirtualizationStory = () => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 40,
        overscan: 5,
    });

    return <Table table={table} rowVirtualizer={rowVirtualizer} stickyHeader />;
};
