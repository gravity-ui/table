import React from 'react';

import {useRowVirtualizer, useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import type {Item} from '../../../BaseTable/__stories__/types';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../index';
import type {TableProps} from '../../index';

const data = generateData(300);

export const VirtualizationStory = (args: Omit<TableProps<Item>, 'table' | 'rowVirtualizer'>) => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const containerRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 40,
        overscan: 5,
        getScrollElement: () => containerRef.current,
    });

    return (
        <div ref={containerRef} style={{height: '90vh', overflow: 'auto'}}>
            <Table {...args} table={table} rowVirtualizer={rowVirtualizer} stickyHeader />
        </div>
    );
};
