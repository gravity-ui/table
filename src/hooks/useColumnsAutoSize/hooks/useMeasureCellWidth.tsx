import * as React from 'react';

import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';

import {cellDefaultWidth, headerDefaultWidth} from '../constants';
import {renderElementForMeasure as defaultRenderElementForMeasure} from '../utils/renderElementForMeasure';

export type UseMeasureCellWidthProps = {
    renderElementForMeasure?: (element?: React.ReactNode) => JSX.Element;
};

export function useMeasureCellWidth({
    renderElementForMeasure = defaultRenderElementForMeasure,
}: UseMeasureCellWidthProps) {
    const rootRef = React.useRef<Root | null>(null);
    const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
    const lastMeasuredElementRef = React.useRef<{
        element: React.ReactNode;
        width: number;
    } | null>(null);

    React.useEffect(() => {
        return () => {
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }

            if (measureContainerRef.current) {
                document.body.removeChild(measureContainerRef.current);
                measureContainerRef.current = null;
            }
        };
    }, []);

    return React.useCallback(
        (element: React.ReactNode, cellType: 'header' | 'cell' = 'cell') => {
            if (element === null || element === undefined) {
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
                rootRef.current = createRoot(container);
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
                rootRef.current!.render(renderElementForMeasure(element));

                return new Promise<number>((resolve) => {
                    setTimeout(() => {
                        try {
                            const container = measureContainerRef.current;
                            const width = container?.getBoundingClientRect().width ?? 0;

                            if (width === 0) {
                                const defaultWidth =
                                    cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                                lastMeasuredElementRef.current = {element, width: defaultWidth};
                                resolve(defaultWidth);
                            } else {
                                lastMeasuredElementRef.current = {element, width};
                                resolve(width);
                            }
                        } catch {
                            const defaultWidth =
                                cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                            lastMeasuredElementRef.current = {element, width: defaultWidth};
                            resolve(defaultWidth);
                        }
                    }, 0);
                });
            } catch {
                const defaultWidth = cellType === 'header' ? headerDefaultWidth : cellDefaultWidth;

                lastMeasuredElementRef.current = {element, width: defaultWidth};

                return defaultWidth;
            }
        },
        [renderElementForMeasure],
    );
}
