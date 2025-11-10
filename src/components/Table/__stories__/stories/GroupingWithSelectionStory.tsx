import * as React from 'react';

import type {ColumnDef, ExpandedState, RowSelectionState} from '@tanstack/react-table';

import {selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {getFixedRowSelection} from '../../../../utils/getFixedRowSelection';
import {TreeExpandableCell} from '../../../TreeExpandableCell';
import {Table} from '../../Table';
import type {GroupOrItem} from '../constants/grouping';
import {columns, data} from '../constants/grouping';

const patchedColumns = [selectionColumn as ColumnDef<GroupOrItem>, ...columns];

export const GroupingWithSelectionStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const getSubRows = (item: GroupOrItem) => ('items' in item ? item.items : undefined);
    const getRowId = (item: GroupOrItem) => item.id;

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
        onRowSelectionChange: getFixedRowSelection({
            rowSelection,
            setRowSelection,
            tableData: data,
            getSubRows,
            getRowId,
        }),
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
