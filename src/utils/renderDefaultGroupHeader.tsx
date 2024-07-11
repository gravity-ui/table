import React from 'react';

import {ArrowToggle} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {b} from '../components/Table/Table.classname';

export const renderDefaultGroupHeader = <TData,>(
    row: Row<TData>,
    getGroupTitle?: (row: Row<TData>) => React.ReactNode,
) => (
    <div className={b('cell-content', b('group-title-wrapper'))}>
        <h2 className={b('group-title')}>
            <button onClick={row.getToggleExpandedHandler()} className={b('group-expand-button')}>
                <ArrowToggle direction={row.getIsExpanded() ? 'bottom' : 'right'} size={16} />
                <span className={b('group-title-content')}>
                    <span>{getGroupTitle?.(row) ?? row.id}</span>
                    <span className={b('group-total')}>{row.subRows.length ?? ''}</span>
                </span>
            </button>
        </h2>
    </div>
);
