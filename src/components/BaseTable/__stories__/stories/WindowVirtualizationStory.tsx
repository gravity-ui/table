import React from 'react';

import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import {generateData} from '../utils';

import {cnVirtualizationStory} from './VirtualizationStory.classname';

import './VirtualizationStory.scss';

const data = generateData(300);

export const WindowVirtualizationStory = () => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const bodyRef = React.useRef<HTMLTableSectionElement>(null);

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 20,
        overscan: 5,
        scrollMargin: bodyRef.current?.offsetTop ?? 0,
    });

    return (
        <BaseTable
            table={table}
            rowVirtualizer={rowVirtualizer}
            className={cnVirtualizationStory()}
            headerClassName={cnVirtualizationStory('header')}
            stickyHeader
            bodyRef={bodyRef}
        />
    );
};
