import type {ColumnDef} from '@tanstack/react-table';

import type {TableActionsSettings, TableSettingsOptions} from '../components';

import {getActionsColumn} from './actionsColumn';
import {getSettingsColumn} from './settingsColumn';

export const SETTINGS_WITH_ACTIONS_COLUMN_ID = '_settings-with-actions';
const SETTINGS_WITH_ACTIONS_COLUMN_SIZE = 44;

export const getSettingsWithActionsColumn = <TData extends unknown>(
    columnId = SETTINGS_WITH_ACTIONS_COLUMN_ID,
    options: {
        actions: TableActionsSettings<TData>;
        settings?: TableSettingsOptions;
    },
): ColumnDef<TData> => {
    return {
        ...getActionsColumn(columnId, options.actions),
        ...getSettingsColumn(columnId, options.settings),

        id: columnId,
        size: SETTINGS_WITH_ACTIONS_COLUMN_SIZE,
        minSize: SETTINGS_WITH_ACTIONS_COLUMN_SIZE,
    };
};
