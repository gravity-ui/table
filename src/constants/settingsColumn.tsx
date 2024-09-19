import type {ColumnDef} from '@tanstack/react-table';

import {TableSettings} from '../components/TableSettings/TableSettings';

export const settingsColumn: ColumnDef<unknown> = {
    id: '_settings',
    accessorKey: '_settings',
    header: TableSettings,
    size: 32,
    minSize: 32,
};
