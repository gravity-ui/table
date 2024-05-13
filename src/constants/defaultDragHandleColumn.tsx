import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {DragHandle} from '../components';

export const defaultDragHandleColumn: ColumnDef<unknown> = {
    id: '_drag',
    header: '',
    cell: ({row}) => {
        return <DragHandle row={row} />;
    },
    size: 14,
    minSize: 14,
};
