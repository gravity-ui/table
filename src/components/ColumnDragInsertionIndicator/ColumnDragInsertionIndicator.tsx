import * as React from 'react';

import type {Table} from '@tanstack/react-table';

import {b} from './ColumnDragInsertionIndicator.classname';
import {getInsertionLineSide} from './utils/getInsertionLineSide';
import {measureIndicator} from './utils/measureIndicator';

import './ColumnDragInsertionIndicator.scss';

export interface ColumnDragInsertionIndicatorProps<TData> {
    table: Table<TData>;
    scopeRef: React.RefObject<HTMLElement>;
    activeColumnId: string | null;
    targetColumnId: string | null;
}

export function ColumnDragInsertionIndicator<TData>({
    table,
    scopeRef,
    activeColumnId,
    targetColumnId,
}: ColumnDragInsertionIndicatorProps<TData>) {
    const side =
        activeColumnId && targetColumnId
            ? getInsertionLineSide(table, activeColumnId, targetColumnId)
            : null;

    const [style, setStyle] = React.useState<React.CSSProperties | null>(null);

    React.useLayoutEffect(() => {
        if (!side || !targetColumnId) {
            setStyle(null);
            return;
        }

        const update = () => {
            setStyle(measureIndicator(scopeRef, targetColumnId, side));
        };

        update();

        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [scopeRef, side, targetColumnId]);

    if (!style) {
        return null;
    }

    return <div className={b()} style={style} aria-hidden="true" />;
}
