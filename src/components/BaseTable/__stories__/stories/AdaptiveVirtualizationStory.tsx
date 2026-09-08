import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {
    HEAVY_METRIC_COLUMN_COUNT,
    adaptiveVirtualizationColumns,
} from '../constants/adaptiveVirtualizationColumns';
import {canDeferHeavyCellContent} from '../utils/canDeferHeavyCellContent';
import {generateAdaptiveVirtualizationData} from '../utils/generateAdaptiveVirtualizationData';

import {cnProductionVirtualizationStory} from './ProductionVirtualizationStory.classname';

import './ProductionVirtualizationStory.scss';

const data = generateAdaptiveVirtualizationData(40);

export const AdaptiveVirtualizationStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const table = useTable({
        columns: adaptiveVirtualizationColumns,
        data,
        enableColumnPinning: true,
        enableExpanding: true,
        getRowId: (item) => item.id,
        getSubRows: (item) => item.children,
        onExpandedChange: setExpanded,
        state: {
            columnPinning: {left: ['service', 'status'], right: []},
            expanded,
        },
    });
    const bodyRef = React.useRef<HTMLTableSectionElement>(null);
    const rows = table.getRowModel().rows;

    const getItemKey = React.useCallback(
        (index: number) => rows[index]?.id ?? `missing:${index}`,
        [rows],
    );
    const rowVirtualizer = useWindowRowVirtualizer({
        adaptiveFlushSync: true,
        count: rows.length,
        directDomUpdates: true,
        directDomUpdatesMode: 'position',
        estimateSize: () => 58,
        getItemKey,
        overscan: 12,
        scrollMargin: bodyRef.current?.offsetTop ?? 0,
    });

    return (
        <section
            className={cnProductionVirtualizationStory()}
            data-qa="adaptive-virtualization-scroll"
        >
            <div className={cnProductionVirtualizationStory('summary')}>
                <span className={cnProductionVirtualizationStory('title')}>
                    Production service hierarchy
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    {data.length} domains · {rows.length.toLocaleString()} expanded nodes
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    {adaptiveVirtualizationColumns.length} columns
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    {HEAVY_METRIC_COLUMN_COUNT} expensive metric renderers per row
                </span>
            </div>
            <BaseTable
                attributes={{style: {width: table.getTotalSize()}}}
                bodyRef={bodyRef}
                canDeferOffscreenCellContent={canDeferHeavyCellContent}
                className={cnProductionVirtualizationStory('table')}
                headerClassName={cnProductionVirtualizationStory('header')}
                rowAttributes={(row) =>
                    ({
                        'data-depth': row.depth,
                        'data-row-id': row.id,
                    }) as React.HTMLAttributes<HTMLTableRowElement>
                }
                rowVirtualizer={rowVirtualizer}
                stickyHeader
                table={table}
            />
        </section>
    );
};
