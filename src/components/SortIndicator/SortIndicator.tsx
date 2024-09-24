import React from 'react';

import {Icon} from '@gravity-ui/uikit';

import {getSortIndicatorIcon} from '../../utils';
import type {BaseSortIndicatorProps} from '../BaseSortIndicator';

import {b} from './SortIndicator.classname';

import './SortIndicator.scss';

export interface SortIndicatorProps<TData, TValue> extends BaseSortIndicatorProps<TData, TValue> {}

export const SortIndicator = <TData, TValue>({
    className,
    header,
}: SortIndicatorProps<TData, TValue>) => {
    const order = header.column.getIsSorted();

    return (
        <span className={b({order}, className)}>
            <Icon data={getSortIndicatorIcon(order)} size={16} />
        </span>
    );
};
