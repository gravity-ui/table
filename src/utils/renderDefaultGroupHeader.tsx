import React from 'react';

import type {Row} from '@tanstack/react-table';

import {b} from '../components/Table/Table.classname';

export const renderDefaultGroupHeader = <TData,>(
    row: Row<TData>,
    getGroupTitle?: (row: Row<TData>) => React.ReactNode,
) => (
    <h2 className={b('group-title')}>
        <button onClick={row.getToggleExpandedHandler()} className={b('group-expand-button')}>
            <svg
                className={b('group-title-arrow', {down: row.getIsExpanded()})}
                viewBox="0 0 16 16"
                width="16"
                height="16"
            >
                <path
                    d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06Z"
                    fill="currentColor"
                />
            </svg>
            <span className={b('group-title-content')}>
                <span>{getGroupTitle?.(row) ?? row.id}</span>
                <span className={b('group-total')}>{row.subRows.length ?? ''}</span>
            </span>
        </button>
    </h2>
);
