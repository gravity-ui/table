import * as React from 'react';

import {dragHandleColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/base';
import {ColumnReorderingProvider} from '../../../ColumnReorderingProvider';
import type {ColumnReorderingProviderProps} from '../../../ColumnReorderingProvider';
import type {ReorderingProviderProps} from '../../../ReorderingProvider';
import {ReorderingProvider} from '../../../ReorderingProvider';
import {BaseTable} from '../../BaseTable';
import {columns as originalColumns} from '../constants/columns';
import {data as originalData} from '../constants/data';
import type {Item} from '../types';

const columns: ColumnDef<Item>[] = [dragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const RowAndColumnReorderingStory = () => {
    const [data, setData] = React.useState(originalData);
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        state: {columnOrder},
        onColumnOrderChange: setColumnOrder,
    });

    const handleRowReorder = React.useCallback<
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

    const handleColumnReorder = React.useCallback<
        NonNullable<ColumnReorderingProviderProps<Item>['onReorder']>
    >(({columnOrder: nextColumnOrder}) => {
        setColumnOrder(nextColumnOrder);
    }, []);

    return (
        <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
            <ReorderingProvider table={table} onReorder={handleRowReorder}>
                <div style={{maxWidth: 800, overflow: 'auto'}}>
                    <BaseTable table={table} />
                </div>
            </ReorderingProvider>
        </ColumnReorderingProvider>
    );
};
