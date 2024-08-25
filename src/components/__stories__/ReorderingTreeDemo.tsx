import React from 'react';

import type {ColumnDef, ExpandedState} from '@tanstack/react-table';

import {defaultDragHandleColumn} from '../../constants';
import {withTableReorder} from '../../hocs';
import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';

import type {TreeItem} from './constants/tree';
import {draggableTreeColumns, data as originalData} from './constants/tree';
import {useTreeDataReordering} from './hooks/useTreeDataReordering';

const TableWithReordering = withTableReorder(BaseTable);

const columns: ColumnDef<TreeItem>[] = [
    defaultDragHandleColumn as ColumnDef<TreeItem>,
    ...draggableTreeColumns,
];

export const ReorderingTreeDemo = () => {
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

    return <TableWithReordering table={table} enableNesting onReorder={handleReorder} />;
};
