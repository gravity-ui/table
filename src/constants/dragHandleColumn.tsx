import {DragHandle} from '../components';
import type {ColumnDef} from '../types/base';

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
