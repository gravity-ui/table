import type {Header} from '../../types/base';

import {b} from './BaseSortIndicator.classname';

import './BaseSortIndicator.scss';

export interface BaseSortIndicatorProps<TData, TValue> {
    className?: string;
    header: Header<TData, TValue>;
}

export const BaseSortIndicator = <TData, TValue>({
    className,
    header,
}: BaseSortIndicatorProps<TData, TValue>) => {
    const order = header.column.getIsSorted();

    return (
        <span className={b({order, invisible: !order}, className)}>
            <svg width="6" height="3" viewBox="0 0 6 3" fill="currentColor">
                <path d="M0.404698 0C0.223319 0 0.102399 0.0887574 0.0419396 0.230769C-0.0386733 0.372781 0.00163315 0.497041 0.122552 0.60355L2.72232 2.89349C2.80293 2.9645 2.88354 3 3.00446 3C3.10523 3 3.20599 2.9645 3.28661 2.89349L5.88637 0.60355C6.00729 0.497041 6.02745 0.372781 5.96699 0.230769C5.88637 0.0887574 5.76545 0 5.60423 0H0.404698Z" />
            </svg>
        </span>
    );
};
