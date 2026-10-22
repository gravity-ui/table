import * as React from 'react';

import {cellDefaultWidth, headerDefaultWidth} from '../constants';
import {createMeasureRoot} from '../utils/createMeasureRoot';
import type {MeasureRoot} from '../utils/createMeasureRoot';
import {disposeMeasureRoot} from '../utils/disposeMeasureRoot';
import {renderElementForMeasure as defaultRenderElementForMeasure} from '../utils/renderElementForMeasure';

export type UseMeasureCellWidthProps = {
    renderElementForMeasure?: (element?: React.ReactNode) => JSX.Element;
};

export function useMeasureCellWidth({
    renderElementForMeasure = defaultRenderElementForMeasure,
}: UseMeasureCellWidthProps) {
    const rootRef = React.useRef<MeasureRoot | null>(null);
    const rootPromiseRef = React.useRef<Promise<MeasureRoot> | null>(null);
    const isUnmountedRef = React.useRef(false);
    const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
    const lastMeasuredElementRef = React.useRef<{
        element: React.ReactNode;
        width: number;
    } | null>(null);
    const measurementQueueRef = React.useRef(Promise.resolve());

    React.useEffect(() => {
        isUnmountedRef.current = false;

        return () => {
            isUnmountedRef.current = true;
            const root = rootRef.current;
            const rootPromise = rootPromiseRef.current;
            const container = measureContainerRef.current;

            rootRef.current = null;
            rootPromiseRef.current = null;
            lastMeasuredElementRef.current = null;
            measureContainerRef.current = null;

            if (root) {
                disposeMeasureRoot(root, container);
            } else if (rootPromise) {
                rootPromise.then(
                    (resolvedRoot) => disposeMeasureRoot(resolvedRoot, container),
                    () => container?.remove(),
                );
            } else {
                container?.remove();
            }
        };
    }, []);

    const ensureRoot = React.useCallback((container: HTMLElement) => {
        if (rootRef.current) {
            return Promise.resolve(rootRef.current);
        }

        if (!rootPromiseRef.current) {
            rootPromiseRef.current = createMeasureRoot(container).then((root) => {
                // The hook may have unmounted while the React 18 client entry
                // was being resolved. The cleanup attached to this promise owns disposal.
                if (isUnmountedRef.current) {
                    return root;
                }

                rootRef.current = root;

                return root;
            });
        }

        return rootPromiseRef.current;
    }, []);

    const measureCellWidth = React.useCallback(
        async (element: React.ReactNode, cellType: 'header' | 'cell' = 'cell') => {
            if (isUnmountedRef.current || element === null || element === undefined) {
                return 0;
            }

            if (!measureContainerRef.current) {
                const container = document.createElement('div');

                container.style.position = 'absolute';
                container.style.visibility = 'hidden';
                container.style.left = '-9999px';
                container.style.top = '-9999px';
                container.style.width = 'auto';
                container.style.display = 'inline-block';

                document.body.appendChild(container);
                measureContainerRef.current = container;
            }

            if (
                lastMeasuredElementRef.current &&
                lastMeasuredElementRef.current.element === element
            ) {
                return lastMeasuredElementRef.current.width;
            }

            if (
                typeof element === 'string' ||
                typeof element === 'number' ||
                typeof element === 'boolean'
            ) {
                const text = String(element);

                if (text.trim() === '') {
                    return 0;
                }

                const tempElement = document.createElement('div');

                tempElement.style.whiteSpace = 'nowrap';
                tempElement.style.display = 'inline-block';
                tempElement.style.visibility = 'hidden';
                tempElement.style.position = 'static';
                tempElement.style.fontWeight = cellType === 'header' ? 'bold' : 'normal';
                tempElement.textContent = text;

                measureContainerRef.current?.appendChild(tempElement);

                const width = tempElement.getBoundingClientRect().width;

                measureContainerRef.current?.removeChild(tempElement);

                lastMeasuredElementRef.current = {element, width};

                return width;
            }

            try {
                const container = measureContainerRef.current;
                const root = await ensureRoot(container);

                if (isUnmountedRef.current || measureContainerRef.current !== container) {
                    return 0;
                }

                root.render(renderElementForMeasure(element));

                return new Promise<number>((resolve) => {
                    setTimeout(() => {
                        if (isUnmountedRef.current) {
                            resolve(0);
                            return;
                        }

                        try {
                            const activeContainer = measureContainerRef.current;
                            const width = activeContainer?.getBoundingClientRect().width ?? 0;

                            if (width === 0) {
                                const defaultWidth =
                                    cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                                resolve(defaultWidth);
                            } else {
                                resolve(width);
                            }
                        } catch {
                            const defaultWidth =
                                cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                            resolve(defaultWidth);
                        } finally {
                            if (rootRef.current === root) {
                                root.render(null);
                            }
                        }
                    }, 0);
                });
            } catch {
                const defaultWidth = cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                return defaultWidth;
            }
        },
        [ensureRoot, renderElementForMeasure],
    );

    return React.useCallback(
        (element: React.ReactNode, cellType: 'header' | 'cell' = 'cell') => {
            if (
                element === null ||
                element === undefined ||
                typeof element === 'string' ||
                typeof element === 'number' ||
                typeof element === 'boolean'
            ) {
                return measureCellWidth(element, cellType);
            }

            const measurement = measurementQueueRef.current.then(
                () => measureCellWidth(element, cellType),
                () => measureCellWidth(element, cellType),
            );

            measurementQueueRef.current = measurement.then(
                () => undefined,
                () => undefined,
            );

            return measurement;
        },
        [measureCellWidth],
    );
}
