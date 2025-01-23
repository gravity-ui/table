import * as React from 'react';

import type {ColumnDef, ColumnPinningState} from '@tanstack/react-table';

import {SETTINGS_WITH_ACTIONS_COLUMN_ID, getSettingsWithActionsColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {Item} from '../../../BaseTable/__stories__/types';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../../Table/Table';
import {actionsSettings, baseColumns} from '../constants';

const data = generateData(5);

const columns: ColumnDef<Item>[] = [
    ...baseColumns,
    getSettingsWithActionsColumn<Item>(SETTINGS_WITH_ACTIONS_COLUMN_ID, {
        actions: actionsSettings,
        settings: {
            sortable: true,
            filterable: true,
        },
    }),
];

export const RowActionsWithActionsColumnStory = () => {
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [],
        right: [SETTINGS_WITH_ACTIONS_COLUMN_ID],
    });
    const table = useTable({
        columns,
        data,
        enableColumnPinning: true,
        state: {columnPinning},
        onColumnPinningChange: setColumnPinning,
    });

    return <Table table={table} />;
};
