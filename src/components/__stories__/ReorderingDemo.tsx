import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {defaultDragHandleColumn} from '../../constants';
import {withTableReorder} from '../../hocs';
import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';
import type {SortableListDragResult} from '../SortableList';

import {columns as originalColumns} from './constants/columns';
import {data as originalData} from './constants/data';
import type {Item} from './types';

const TableWithReordering = withTableReorder(BaseTable);

const columns: ColumnDef<Item>[] = [defaultDragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const ReorderingDemo = () => {
    const [data, setData] = React.useState(originalData);

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
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

    return <TableWithReordering table={table} onReorder={handleReorder} />;
};
