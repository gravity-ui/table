import React from 'react';

import {b} from './VirtualizationContainer.classname';

import './VirtualizationContainer.scss';

export interface TableVirtualizationContainerProps {
    children?: React.ReactNode;
    className?: string;
    height?: string;
    withScroll?: boolean;
}

export const VirtualizationContainer = React.forwardRef<
    HTMLDivElement,
    TableVirtualizationContainerProps
>(({className, height, withScroll, children}, ref) => {
    return (
        <div
            ref={ref}
            className={b({'with-scroll': withScroll}, className)}
            style={
                height
                    ? {
                          height,
                      }
                    : undefined
            }
        >
            {children}
        </div>
    );
});

VirtualizationContainer.displayName = 'VirtualizationContainer';
