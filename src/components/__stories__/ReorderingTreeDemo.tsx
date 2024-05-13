import React from 'react';

import {withTableReorder} from '../../hocs';
import {Table} from '../Table';

import type {TreeItem} from './constants/tree';
import {draggableTreeColumns, data as initialData} from './constants/tree';
import {useTreeDataReordering} from './hooks/useTreeDataReordering';

const TableWithReordering = withTableReorder(Table);

const getSubRows = (item: TreeItem) => item.children;
const getRowId = (item: TreeItem) => item.id;

export function ReorderingTreeDemo() {
    const [expandedIds, setExpandedIds] = React.useState<string[]>([]);
    const [data, setData] = React.useState(initialData);

    const handleDragEnd = useTreeDataReordering({data, setData});

    return (
        <TableWithReordering<TreeItem>
            data={data}
            columns={draggableTreeColumns}
            getSubRows={getSubRows}
            getRowId={getRowId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            onReorder={handleDragEnd}
            enableNesting
        />
    );
}
