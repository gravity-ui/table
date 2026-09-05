import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {ReorderingProvider} from '../../../ReorderingProvider';
import {BaseTable} from '../../BaseTable';
import type {TreeItem} from '../constants/tree';
import {draggableTreeColumns} from '../constants/tree';
import {useTreeDataReordering} from '../hooks/useTreeDataReordering';
import {canDeferHeavyCellContent} from '../utils/canDeferHeavyCellContent';
import {createHeavyVirtualizationColumns} from '../utils/createHeavyVirtualizationColumns';

import {cnProductionVirtualizationStory} from './ProductionVirtualizationStory.classname';

import './ProductionVirtualizationStory.scss';

const HEAVY_TREE_METRIC_COLUMN_COUNT = 18;
const productionTreeColumns = [
    ...draggableTreeColumns,
    ...createHeavyVirtualizationColumns<TreeItem>(HEAVY_TREE_METRIC_COLUMN_COUNT),
];

const initialData: TreeItem[] = Array.from({length: 80}, (_value, index) => {
    let status: TreeItem['status'] = 'free';
    if (index % 13 === 0) {
        status = 'unknown';
    } else if (index % 5 === 0) {
        status = 'busy';
    }

    return {
        age: 20 + (index % 50),
        id: `row-${index}`,
        name:
            index % 5 === 0
                ? `Person ${index} with a deliberately long title that wraps onto another line`
                : `Person ${index}`,
        status,
    };
});

export interface ReorderingTreeWithVirtualizationStoryProps {
    autoScroll?: boolean;
}

export const ReorderingTreeWithVirtualizationStory = ({
    autoScroll = true,
}: ReorderingTreeWithVirtualizationStoryProps) => {
    const [data, setData] = React.useState(initialData);
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const bodyRef = React.useRef<HTMLTableSectionElement>(null);
    const handleReorder = useTreeDataReordering({data, setData});
    const table = useTable({
        columns: productionTreeColumns,
        data,
        enableColumnPinning: true,
        enableExpanding: true,
        getRowId: (item) => item.id,
        getSubRows: (item) => item.children,
        onExpandedChange: setExpanded,
        state: {
            columnPinning: {left: ['name'], right: []},
            expanded,
        },
    });
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
            data-qa="virtualized-tree-reordering-scroll"
        >
            <div className={cnProductionVirtualizationStory('summary')}>
                <span className={cnProductionVirtualizationStory('title')}>
                    Production dependency tree
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    nested row reordering
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    window virtualization
                </span>
                <span className={cnProductionVirtualizationStory('summary-item')}>
                    {HEAVY_TREE_METRIC_COLUMN_COUNT} expensive metric renderers per row
                </span>
            </div>
            <ReorderingProvider
                table={table}
                autoScroll={autoScroll}
                dragWithoutHandle
                enableNesting
                onReorder={handleReorder}
            >
                <BaseTable
                    attributes={{style: {width: table.getTotalSize()}}}
                    bodyRef={bodyRef}
                    canDeferOffscreenCellContent={canDeferHeavyCellContent}
                    className={cnProductionVirtualizationStory('table')}
                    headerClassName={cnProductionVirtualizationStory('header')}
                    rowAttributes={(row) =>
                        ({
                            'data-depth': row.depth,
                            'data-key': row.id,
                            'data-parent-id': row.parentId ?? '',
                            'data-row-id': row.id,
                        }) as React.HTMLAttributes<HTMLTableRowElement>
                    }
                    rowVirtualizer={rowVirtualizer}
                    stickyHeader
                    table={table}
                />
            </ReorderingProvider>
        </section>
    );
};
