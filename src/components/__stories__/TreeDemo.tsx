import React from 'react';

import {Table} from '../Table';

import type {TreeItem} from './constants/tree';
import {columns, data} from './constants/tree';

const getSubRows = (item: TreeItem) => item.children;
const getRowId = (item: TreeItem) => item.id;

export function TreeDemo() {
    const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

    return (
        <Table<TreeItem>
            data={data}
            columns={columns}
            getSubRows={getSubRows}
            getRowId={getRowId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
        />
    );
}
