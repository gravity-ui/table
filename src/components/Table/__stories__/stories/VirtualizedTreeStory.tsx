import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useRowVirtualizer, useTable} from '../../../../hooks';
import {data, getColumns} from '../../../BaseTable/__stories__/constants/tree';
import {Table} from '../../Table';
import type {TableProps} from '../../Table';

const columns = getColumns(true);

export const VirtualizedTreeStory = (props: TableProps<(typeof data)[number]>) => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
    });

    const containerRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 40,
        overscan: 1,
        getScrollElement: () => containerRef.current,
    });

    return (
        <div ref={containerRef} style={{height: '90vh', overflow: 'auto'}}>
            <Table
                {...props}
                table={table}
                rowVirtualizer={rowVirtualizer}
                headerCellAttributes={(header) => {
                    if (header.column.id === 'name') {
                        return {style: {paddingInlineStart: 36}};
                    }
                    return {};
                }}
            />
        </div>
    );
};
