import * as React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {dragHandleColumn} from '../../../../constants';
import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {getVirtualRowRangeExtractor} from '../../../../utils';
import {ReorderingProvider} from '../../../ReorderingProvider';
import type {ReorderingProviderProps} from '../../../ReorderingProvider';
import {BaseTable} from '../../BaseTable';
import {columns as originalColumns} from '../constants/columns';
import type {Item} from '../types';
import {generateData} from '../utils';

import {cnVirtualizationStory} from './VirtualizationStory.classname';

import './VirtualizationStory.scss';

const columns: ColumnDef<Item>[] = [dragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const ReorderingWithVirtualizationStory = () => {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const [data, setData] = React.useState(() => generateData(300));

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
        rangeExtractor: getVirtualRowRangeExtractor(tableRef.current),
        scrollMargin: bodyRef.current?.offsetTop ?? 0,
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
            <BaseTable
                ref={tableRef}
                bodyRef={bodyRef}
                table={table}
                rowVirtualizer={rowVirtualizer}
                stickyHeader
                className={cnVirtualizationStory()}
                headerClassName={cnVirtualizationStory('header')}
            />
        </ReorderingProvider>
    );
};
