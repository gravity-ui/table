import * as React from 'react';

import type {Column} from '@tanstack/react-table';

import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';
import {getHorizontalScrollMetrics} from '../utils/getHorizontalScrollMetrics';
import {getImmediateColumnIds} from '../utils/getImmediateColumnIds';
import {resolveHorizontalScrollElement} from '../utils/resolveHorizontalScrollElement';

interface OffscreenCellContentState {
    canStageCellContent: boolean;
    forceCellContentHydration: boolean;
    immediateCellContentColumnIds: ReadonlySet<string> | null;
    scheduleCellContentHydration: (hydrate: () => void) => () => void;
}

interface UseOffscreenCellContentProps<TData> {
    bodyElementRef: React.RefObject<HTMLTableSectionElement | null>;
    columnDragActive: boolean;
    enabled: boolean;
    scrollElement: Element | Window | null | undefined;
    centerColumns: Column<TData, unknown>[];
    leftColumns: Column<TData, unknown>[];
    rightColumns: Column<TData, unknown>[];
}

export const useOffscreenCellContent = <TData>({
    bodyElementRef,
    columnDragActive,
    enabled,
    scrollElement,
    centerColumns,
    leftColumns,
    rightColumns,
}: UseOffscreenCellContentProps<TData>): OffscreenCellContentState => {
    const pendingHydrationsRef = React.useRef(new Set<() => void>());
    const hydrationFrameRef = React.useRef<number>();
    const hydrationTaskReleaseRef = React.useRef<() => void>();
    const horizontalScrollObservedRef = React.useRef(false);
    const horizontalScrollLeftRef = React.useRef<number | null>(null);
    const [horizontalScrollObserved, setHorizontalScrollObserved] = React.useState(false);
    const [horizontalScrollElement, setHorizontalScrollElement] = React.useState<
        Element | Window | null
    >(null);

    const columnGeometry = [leftColumns, centerColumns, rightColumns]
        .map((columns) => columns.map((column) => `${column.id}:${column.getSize()}`).join('|'))
        .join(';');
    const previousColumnGeometryRef = React.useRef(columnGeometry);
    const columnGeometryChanged = previousColumnGeometryRef.current !== columnGeometry;

    const cancelHydration = React.useCallback(() => {
        const targetWindow = bodyElementRef.current?.ownerDocument.defaultView;
        if (hydrationFrameRef.current !== undefined) {
            targetWindow?.cancelAnimationFrame(hydrationFrameRef.current);
            hydrationFrameRef.current = undefined;
        }
        hydrationTaskReleaseRef.current?.();
        hydrationTaskReleaseRef.current = undefined;
    }, [bodyElementRef]);

    const flushHydrations = React.useCallback(() => {
        cancelHydration();
        const pendingHydrations = [...pendingHydrationsRef.current];
        pendingHydrationsRef.current.clear();
        pendingHydrations.forEach((hydrate) => hydrate());
    }, [cancelHydration]);

    const scheduleCellContentHydration = React.useCallback(
        (hydrate: () => void) => {
            const pendingHydrations = pendingHydrationsRef.current;
            pendingHydrations.add(hydrate);

            const targetWindow = bodyElementRef.current?.ownerDocument.defaultView;
            if (
                targetWindow &&
                hydrationFrameRef.current === undefined &&
                hydrationTaskReleaseRef.current === undefined
            ) {
                hydrationFrameRef.current = targetWindow.requestAnimationFrame(() => {
                    hydrationFrameRef.current = undefined;
                    if (pendingHydrations.size === 0) {
                        return;
                    }

                    if (typeof targetWindow.MessageChannel === 'function') {
                        const channel = new targetWindow.MessageChannel();
                        let active = true;
                        const release = () => {
                            if (!active) {
                                return;
                            }
                            active = false;
                            channel.port1.onmessage = null;
                            channel.port1.close();
                            channel.port2.close();
                        };
                        channel.port1.onmessage = () => {
                            release();
                            hydrationTaskReleaseRef.current = undefined;
                            flushHydrations();
                        };
                        hydrationTaskReleaseRef.current = release;
                        channel.port2.postMessage(undefined);
                    } else {
                        const timeoutId = targetWindow.setTimeout(() => {
                            hydrationTaskReleaseRef.current = undefined;
                            flushHydrations();
                        }, 0);
                        hydrationTaskReleaseRef.current = () =>
                            targetWindow.clearTimeout(timeoutId);
                    }
                });
            }

            return () => {
                pendingHydrations.delete(hydrate);
                if (pendingHydrations.size === 0) {
                    cancelHydration();
                }
            };
        },
        [bodyElementRef, cancelHydration, flushHydrations],
    );

    useIsomorphicLayoutEffect(() => {
        previousColumnGeometryRef.current = columnGeometry;
        if (columnGeometryChanged) {
            flushHydrations();
        }
    }, [columnGeometry, columnGeometryChanged, flushHydrations]);

    useIsomorphicLayoutEffect(() => {
        const nextScrollElement = enabled
            ? resolveHorizontalScrollElement(bodyElementRef.current, scrollElement)
            : null;
        setHorizontalScrollElement((current) =>
            current === nextScrollElement ? current : nextScrollElement,
        );
    }, [bodyElementRef, enabled, scrollElement]);

    useIsomorphicLayoutEffect(() => {
        if (!horizontalScrollElement) {
            return undefined;
        }

        horizontalScrollLeftRef.current =
            getHorizontalScrollMetrics(horizontalScrollElement)?.scrollLeft ?? null;

        const handleHorizontalScroll = () => {
            const scrollLeft = getHorizontalScrollMetrics(horizontalScrollElement)?.scrollLeft;
            if (scrollLeft === undefined || scrollLeft === horizontalScrollLeftRef.current) {
                return;
            }
            horizontalScrollLeftRef.current = scrollLeft;
            if (!horizontalScrollObservedRef.current) {
                horizontalScrollObservedRef.current = true;
                setHorizontalScrollObserved(true);
                flushHydrations();
            }
        };

        horizontalScrollElement.addEventListener('scroll', handleHorizontalScroll, {passive: true});
        return () => horizontalScrollElement.removeEventListener('scroll', handleHorizontalScroll);
    }, [flushHydrations, horizontalScrollElement]);

    useIsomorphicLayoutEffect(
        () => () => {
            cancelHydration();
            pendingHydrationsRef.current.clear();
        },
        [cancelHydration],
    );

    const canStageCellContent =
        enabled &&
        Boolean(horizontalScrollElement) &&
        !horizontalScrollObserved &&
        !columnDragActive &&
        !columnGeometryChanged;
    const scrollMetrics = getHorizontalScrollMetrics(horizontalScrollElement);
    const bodyClientWidth = scrollMetrics?.clientWidth ?? 0;
    const bodyScrollLeft = scrollMetrics?.scrollLeft ?? 0;
    const bodyDirection = scrollMetrics?.direction;
    const immediateCellContentColumnIds = React.useMemo(
        () =>
            getImmediateColumnIds({
                bodyClientWidth,
                bodyDirection,
                bodyScrollLeft,
                canStageCellContent,
                centerColumns,
                columnGeometry,
                leftColumns,
                rightColumns,
            }),
        [
            bodyClientWidth,
            bodyDirection,
            bodyScrollLeft,
            canStageCellContent,
            centerColumns,
            columnGeometry,
            leftColumns,
            rightColumns,
        ],
    );

    return {
        canStageCellContent,
        forceCellContentHydration:
            horizontalScrollObserved || columnDragActive || columnGeometryChanged,
        immediateCellContentColumnIds,
        scheduleCellContentHydration,
    };
};
