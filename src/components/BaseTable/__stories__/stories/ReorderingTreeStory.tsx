import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {dragHandleColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/base';
import {ReorderingProvider} from '../../../ReorderingProvider';
import {BaseTable} from '../../BaseTable';
import type {TreeItem} from '../constants/tree';
import {draggableTreeColumns, data as originalData} from '../constants/tree';
import {useTreeDataReordering} from '../hooks/useTreeDataReordering';

const columns: ColumnDef<TreeItem>[] = [
    dragHandleColumn as ColumnDef<TreeItem>,
    ...draggableTreeColumns,
];

export const ReorderingTreeStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [data, setData] = React.useState(originalData);

    const handleReorder = useTreeDataReordering({data, setData});

    const table = useTable({
        columns,
        data,
        enableExpanding: true,
        getRowId: (item) => item.id,
        getSubRows: (item) => item.children,
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
    });

    return (
        <ReorderingProvider table={table} enableNesting onReorder={handleReorder}>
            <BaseTable table={table} />
        </ReorderingProvider>
    );
};
