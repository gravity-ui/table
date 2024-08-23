import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {BaseDragHandle} from '../components';

export const defaultDragHandleColumn: ColumnDef<unknown> = {
    id: '_drag',
    header: '',
    cell: ({row}) => {
        return <BaseDragHandle row={row} />;
    },
    size: 14,
    minSize: 14,
};
