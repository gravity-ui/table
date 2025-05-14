import * as React from 'react';

import {dragHandleColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/tanstack';
import {columns as originalColumns} from '../../../BaseTable/__stories__/constants/columns';
import {data as originalData} from '../../../BaseTable/__stories__/constants/data';
import type {Item} from '../../../BaseTable/__stories__/types';
import type {ReorderingProviderProps} from '../../../ReorderingProvider';
import {ReorderingProvider} from '../../../ReorderingProvider';
import {Table} from '../../Table';

const columns: ColumnDef<Item>[] = [dragHandleColumn as ColumnDef<Item>, ...originalColumns];

export const ReorderingStory = () => {
    const [data, setData] = React.useState(originalData);

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
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
            <Table table={table} />
        </ReorderingProvider>
    );
};
