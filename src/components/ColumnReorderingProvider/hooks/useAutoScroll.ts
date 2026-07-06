import * as React from 'react';

import type {DragStartEvent} from '@dnd-kit/core';
import type {Table} from '@tanstack/react-table';

import {AUTO_SCROLL_EDGE_SIZE, AUTO_SCROLL_MAX_SPEED} from '../constants/autoScroll';
import {findHorizontalScrollContainer} from '../utils/findHorizontalScrollContainer';

export interface UseAutoScrollProps<TData> {
    table: Table<TData>;
    scopeRef: React.RefObject<HTMLElement>;
}

export function useAutoScroll<TData>({table, scopeRef}: UseAutoScrollProps<TData>) {
    const scrollContainerRef = React.useRef<HTMLElement | null>(null);
    const pointerXRef = React.useRef<number | null>(null);
    const rafRef = React.useRef<number | null>(null);

    const getPinnedWidth = React.useCallback(
        (position: 'left' | 'right') => {
            const columns =
                position === 'left'
                    ? table.getLeftVisibleLeafColumns()
                    : table.getRightVisibleLeafColumns();

            return columns.reduce((width, column) => width + column.getSize(), 0);
        },
        [table],
    );

    const handlePointerMove = React.useCallback((event: PointerEvent) => {
        pointerXRef.current = event.clientX;
    }, []);

    const autoScrollStep = React.useCallback(() => {
        const container = scrollContainerRef.current;

        if (!container) {
            rafRef.current = null;
            return;
        }

        const pointerX = pointerXRef.current;

        if (pointerX === null) {
            rafRef.current = requestAnimationFrame(autoScrollStep);
            return;
        }

        const rect = container.getBoundingClientRect();
        const centerLeft = rect.left + getPinnedWidth('left');
        const centerRight = rect.right - getPinnedWidth('right');

        let delta = 0;

        if (pointerX < centerLeft + AUTO_SCROLL_EDGE_SIZE) {
            const intensity = Math.min(
                1,
                (centerLeft + AUTO_SCROLL_EDGE_SIZE - pointerX) / AUTO_SCROLL_EDGE_SIZE,
            );
            delta = -Math.ceil(intensity * AUTO_SCROLL_MAX_SPEED);
        } else if (pointerX > centerRight - AUTO_SCROLL_EDGE_SIZE) {
            const intensity = Math.min(
                1,
                (pointerX - (centerRight - AUTO_SCROLL_EDGE_SIZE)) / AUTO_SCROLL_EDGE_SIZE,
            );
            delta = Math.ceil(intensity * AUTO_SCROLL_MAX_SPEED);
        }

        if (delta !== 0) {
            container.scrollLeft += delta;
        }

        rafRef.current = requestAnimationFrame(autoScrollStep);
    }, [getPinnedWidth]);

    const stopAutoScroll = React.useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        pointerXRef.current = null;
        scrollContainerRef.current = null;
        document.removeEventListener('pointermove', handlePointerMove);
    }, [handlePointerMove]);

    const startAutoScroll = React.useCallback(
        (event: DragStartEvent) => {
            const tableEl = scopeRef.current?.querySelector('table') ?? null;
            scrollContainerRef.current = findHorizontalScrollContainer(tableEl);

            if (!scrollContainerRef.current) {
                return;
            }

            const activator = event.activatorEvent;
            pointerXRef.current = activator instanceof PointerEvent ? activator.clientX : null;

            document.addEventListener('pointermove', handlePointerMove);
            rafRef.current = requestAnimationFrame(autoScrollStep);
        },
        [scopeRef, handlePointerMove, autoScrollStep],
    );

    React.useEffect(
        () => () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }

            document.removeEventListener('pointermove', handlePointerMove);
        },
        [handlePointerMove],
    );

    return {startAutoScroll, stopAutoScroll};
}
