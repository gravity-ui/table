import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {defaultDragHandleColumn} from '../../../../constants';
import {withTableReorder} from '../../../../hocs';
import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {getVirtualRowRangeExtractor} from '../../../../utils';
import {BaseTable} from '../../../BaseTable';
import type {SortableListDragResult} from '../../../SortableList';
import {columns as originalColumns} from '../../constants/columns';
import type {Item} from '../../types';
import {generateData} from '../../utils';

import {cnVirtualizationDemo} from './VirtualizationDemo.classname';

import './VirtualizationDemo.scss';

const TableWithReordering = withTableReorder(BaseTable);

const columns: ColumnDef<Item>[] = [defaultDragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const ReorderingWithVirtualizationDemo = () => {
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

    const handleReorder = React.useCallback(
        ({draggedItemKey, baseItemKey}: SortableListDragResult) => {
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
        },
        [],
    );

    return (
        <TableWithReordering
            ref={tableRef}
            table={table}
            rowVirtualizer={rowVirtualizer}
            onReorder={handleReorder}
            stickyHeader
            className={cnVirtualizationDemo()}
            headerClassName={cnVirtualizationDemo('header')}
        />
    );
};
