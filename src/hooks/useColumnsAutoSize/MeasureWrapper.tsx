import * as React from 'react';

export type MeasureWrapperProps = React.PropsWithChildren;

export const MeasureWrapper = ({children}: MeasureWrapperProps) => {
    return (
        <div
            style={{
                whiteSpace: 'nowrap',
                display: 'inline-block',
                overflow: 'visible',
                width: 'auto',
                padding: '0',
                margin: '0',
                boxSizing: 'border-box',
            }}
        >
            {children || ' '}
        </div>
    );
};
