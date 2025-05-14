import type {TableSettingsOptions} from '../components';
import type {TableActionsSettings} from '../types/RowActions';
import type {ColumnDef} from '../types/tanstack';

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
    const {cell} = getActionsColumn<TData>(columnId, options.actions);
    const {header, meta} = getSettingsColumn<TData>(columnId, options.settings);
    return {
        id: columnId,
        size: SETTINGS_WITH_ACTIONS_COLUMN_SIZE,
        minSize: SETTINGS_WITH_ACTIONS_COLUMN_SIZE,
        cell,
        header,
        meta,
    };
};
