import React from 'react';

import type {ColumnDef, ColumnPinningState, ExpandedState} from '@tanstack/react-table';

import {defaultDragHandleColumn} from '../../constants';
import {withTableReorder} from '../../hocs';
import {useTable} from '../../hooks';
import type {SortableListDragResult} from '../SortableList';
import {Table} from '../Table';

import {cnColumnPinningDemo} from './ColumnPinningDemo.classname';
import {ColumnPinningHeaderCell} from './cells/ColumnPinningHeaderCell';
import {TreeNameCell} from './cells/TreeNameCell';
import {data as originalData} from './constants/data';
import {data as treeData} from './constants/tree';
import type {TreeItem} from './constants/tree';
import type {Item} from './types';

import './ColumnPinningDemo.scss';

const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Name"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 200,
    },
    {
        accessorKey: 'age',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Age"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 200,
    },
    {
        accessorKey: 'status',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Status"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 300,
    },
];

const treeColumns: ColumnDef<TreeItem>[] = [
    {
        accessorKey: 'name',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Name"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        cell: (info) => (
            <TreeNameCell row={info.row} depth={info.row.depth} value={info.getValue<string>()} />
        ),
        minSize: 320,
    },
    {
        accessorKey: 'age',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Age"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 320,
    },
];

export const ColumnPinningDemo = () => {
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [],
        right: [],
    });

    const table = useTable({
        columns,
        data: originalData,
        enableColumnPinning: true,
        onColumnPinningChange: setColumnPinning,
        state: {
            columnPinning,
        },
    });

    return (
        <div className={cnColumnPinningDemo()}>
            <Table className={cnColumnPinningDemo('table')} table={table} />
        </div>
    );
};

const TableWithReordering = withTableReorder(Table);

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

export const ColumnPinningWithTreeDemo = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [defaultDragHandleColumn.id ?? ''],
        right: [],
    });

    const table = useTable({
        columns: treeColumns,
        data: treeData,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        enableColumnPinning: true,
        onColumnPinningChange: setColumnPinning,
        state: {
            columnPinning,
            expanded,
        },
    });

    return (
        <div className={cnColumnPinningDemo()}>
            <Table className={cnColumnPinningDemo('table')} table={table} />
        </div>
    );
};
