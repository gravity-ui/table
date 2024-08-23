import React from 'react';

import type {ColumnDef, ColumnPinningState} from '@tanstack/react-table';

import {defaultDragHandleColumn} from '../../constants';
import {withTableReorder} from '../../hocs';
import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';
import type {SortableListDragResult} from '../SortableList';

import {cnColumnPinningDemo} from './ColumnPinningDemo.classname';
import {columns} from './constants/columnPinning';
import {data as originalData} from './constants/data';
import type {Item} from './types';

import './ColumnPinningDemo.scss';

const TableWithReordering = withTableReorder(BaseTable);

const columnsWithReordering: ColumnDef<Item>[] = [
    {
        ...(defaultDragHandleColumn as ColumnDef<Item>),
        minSize: 16,
    },
    ...columns,
];

export const ColumnPinningWithReorderingDemo = () => {
    const [data, setData] = React.useState(originalData);

    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [defaultDragHandleColumn.id ?? ''],
        right: [],
    });

    const table = useTable({
        data,
        columns: columnsWithReordering,
        getRowId: (item) => item.id,
        enableColumnPinning: true,
        onColumnPinningChange: setColumnPinning,
        state: {
            columnPinning,
        },
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
        <div className={cnColumnPinningDemo()}>
            <TableWithReordering
                className={cnColumnPinningDemo('table')}
                table={table}
                onReorder={handleReorder}
            />
        </div>
    );
};
