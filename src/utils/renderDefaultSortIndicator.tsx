import React from 'react';

import type {Header} from '@tanstack/react-table';

import {SortIndicator} from '../components';
import {b} from '../components/Table/Table.classname';

export const renderDefaultSortIndicator = <TData, TValue>(
    header: Header<TData, TValue>,
    className?: string,
) => (
    <SortIndicator className={b('sort-indicator', className)} order={header.column.getIsSorted()} />
);
