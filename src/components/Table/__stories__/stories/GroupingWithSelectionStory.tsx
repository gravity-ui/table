import * as React from 'react';

import type {ColumnDef, ExpandedState, RowSelectionState} from '@tanstack/react-table';

import {selectionColumn} from '../../../../constants';
import {useRowSelectionFixedHandler, useTable} from '../../../../hooks';
import {TreeExpandableCell} from '../../../TreeExpandableCell';
import {Table} from '../../Table';
import type {GroupOrItem} from '../constants/grouping';
import {columns, generateLargeData} from '../constants/grouping';

const patchedColumns = [selectionColumn as ColumnDef<GroupOrItem>, ...columns];

export const GroupingWithSelectionStory = () => {
    const data = React.useMemo(() => generateLargeData(), []);

    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const getSubRows = (item: GroupOrItem) => ('items' in item ? item.items : undefined);
    const getRowId = (item: GroupOrItem) => item.id;

    const fixedRowSelectionHandler = useRowSelectionFixedHandler({
        rowSelection,
        setRowSelection,
        tableData: data,
        getSubRows,
        getRowId,
    });

    const table = useTable({
        columns: patchedColumns,
        data,
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableSubRowSelection: true,
        getSubRows,
        getRowId,
        onExpandedChange: setExpanded,
        onRowSelectionChange: fixedRowSelectionHandler,
        state: {
            expanded,
            rowSelection,
        },
    });

    return (
        <Table
            table={table}
            renderGroupHeader={({row, getGroupTitle: getGroupTitleProp}) => (
                <TreeExpandableCell row={row}>{getGroupTitleProp?.(row)}</TreeExpandableCell>
            )}
            headerCellAttributes={(header) => {
                if (header.column.id === 'name') {
                    return {style: {paddingInlineStart: 36}};
                }
                return {};
            }}
        />
    );
};
