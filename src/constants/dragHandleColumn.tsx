import type {ColumnDef} from '@tanstack/react-table';

import {DragHandle} from '../components';

export const dragHandleColumn: ColumnDef<unknown> = {
    id: '_drag',
    header: '',
    cell: ({row}) => <DragHandle row={row} />,
    size: 32,
    minSize: 32,
    meta: {
        hideInSettings: true,
    },
};
