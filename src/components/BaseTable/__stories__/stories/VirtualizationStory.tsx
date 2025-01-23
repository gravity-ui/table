import * as React from 'react';

import {useRowVirtualizer, useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import {generateData} from '../utils';

import {cnVirtualizationStory} from './VirtualizationStory.classname';

import './VirtualizationStory.scss';

const data = generateData(300);

export const VirtualizationStory = () => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const containerRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 20,
        overscan: 5,
        getScrollElement: () => containerRef.current,
    });

    return (
        <div ref={containerRef} style={{height: '90vh', overflow: 'auto'}}>
            <BaseTable
                table={table}
                rowVirtualizer={rowVirtualizer}
                className={cnVirtualizationStory()}
                headerClassName={cnVirtualizationStory('header')}
                stickyHeader
            />
        </div>
    );
};
