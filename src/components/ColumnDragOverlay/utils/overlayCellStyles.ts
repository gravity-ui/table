import * as React from 'react';

export function overlayCellStyles(style: React.CSSProperties | undefined): React.CSSProperties {
    return {
        ...style,
        position: 'static',
        left: undefined,
        right: undefined,
        zIndex: undefined,
    };
}
