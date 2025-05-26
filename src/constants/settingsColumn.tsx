import {TableSettings} from '../components/TableSettings/TableSettings';
import type {TableSettingsOptions} from '../components/TableSettings/TableSettings';
import type {ColumnDef} from '../types/base';

export const SETTINGS_COLUMN_ID = '_settings';
const SETTINGS_COLUMN_SIZE = 44;

export const getSettingsColumn = <TData extends unknown>(
    columnId = SETTINGS_COLUMN_ID,
    options?: TableSettingsOptions,
): ColumnDef<TData> => {
    return {
        id: columnId,
        header: ({table}) => <TableSettings table={table} {...options} />,
        size: SETTINGS_COLUMN_SIZE,
        minSize: SETTINGS_COLUMN_SIZE,
        meta: {
            hideInSettings: true,
        },
    };
};
