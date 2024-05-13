import React from 'react';

import type {Header} from '@tanstack/react-table';

import {SortIndicator} from '../SortIndicator';
import {b} from '../Table/Table.classname';

export function renderDefaultSortIndicator<TData, TValue>(
    header: Header<TData, TValue>,
    className?: string,
) {
    return (
        <SortIndicator
            className={b('sort-indicator', className)}
            order={header.column.getIsSorted()}
        />
    );
}
