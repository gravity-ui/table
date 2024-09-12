import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {dragHandleColumn} from '../../../../constants';
import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {getVirtualRowRangeExtractor} from '../../../../utils';
import {columns as originalColumns} from '../../../BaseTable/__stories__/constants/columns';
import type {Item} from '../../../BaseTable/__stories__/types';
import {generateData} from '../../../BaseTable/__stories__/utils';
import type {ReorderingProviderProps} from '../../../ReorderingProvider';
import {ReorderingProvider} from '../../../ReorderingProvider';
import {Table} from '../../Table';

const columns: ColumnDef<Item>[] = [dragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const ReorderingWithVirtualizationStory = () => {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const [data, setData] = React.useState(() => generateData(300));

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
    });

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 20,
        overscan: 5,
        rangeExtractor: getVirtualRowRangeExtractor(tableRef.current),
    });

    const handleReorder = React.useCallback<
        NonNullable<ReorderingProviderProps<Item>['onReorder']>
    >(({draggedItemKey, baseItemKey}) => {
        setData((prevData) => {
            const dataClone = prevData.slice();

            const index = dataClone.findIndex((item) => item.id === draggedItemKey);

            if (index >= 0) {
                const dragged = dataClone.splice(index, 1)[0] as Item;
                const insertIndex = dataClone.findIndex((item) => item.id === baseItemKey);

                if (insertIndex >= 0) {
                    dataClone.splice(insertIndex + 1, 0, dragged);
                } else {
                    dataClone.unshift(dragged);
                }
            }

            return dataClone;
        });
    }, []);

    return (
        <ReorderingProvider table={table} onReorder={handleReorder}>
            <Table ref={tableRef} table={table} rowVirtualizer={rowVirtualizer} stickyHeader />
        </ReorderingProvider>
    );
};