import React from 'react';

import type {Row} from '@tanstack/react-table';

import {b} from './GroupHeader.classname';

import './GroupHeader.scss';

export interface GroupHeaderProps<TData> {
    className?: string;
    getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    row: Row<TData>;
}

export const GroupHeader = <TData,>({className, getGroupTitle, row}: GroupHeaderProps<TData>) => {
    return (
        <h2 className={b(null, className)}>
            <button className={b('button')} onClick={row.getToggleExpandedHandler()}>
                <svg
                    className={b('icon', {expanded: row.getIsExpanded()})}
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                >
                    <path
                        d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06Z"
                        fill="currentColor"
                    />
                </svg>
                <span className={b('content')}>
                    <span className={b('title')}>{getGroupTitle?.(row) ?? row.id}</span>
                    <span className={b('total')}>{row.subRows.length}</span>
                </span>
            </button>
        </h2>
    );
};
