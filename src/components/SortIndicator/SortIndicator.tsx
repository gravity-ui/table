import {ActionTooltip, Icon} from '@gravity-ui/uikit';

import {getSortIndicatorIcon} from '../../utils';
import type {BaseSortIndicatorProps} from '../BaseSortIndicator';

import {b} from './SortIndicator.classname';
import i18n from './i18n';

import './SortIndicator.scss';

export interface SortIndicatorProps<TData, TValue> extends BaseSortIndicatorProps<TData, TValue> {}

export const SortIndicator = <TData, TValue>({
    className,
    header,
}: SortIndicatorProps<TData, TValue>) => {
    const order = header.column.getIsSorted();
    const nextOrder = header.column.getNextSortingOrder();

    let label = i18n('label-sort-reset');

    if (nextOrder) {
        label = nextOrder === 'desc' ? i18n('label-sort-desc') : i18n('label-sort-asc');
    }

    return (
        <ActionTooltip title={label}>
            <span aria-label={label} className={b({order}, className)}>
                <Icon data={getSortIndicatorIcon(order)} size={16} />
            </span>
        </ActionTooltip>
    );
};
