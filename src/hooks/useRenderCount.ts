import * as React from 'react';

/** Dev-only: returns how many times the calling component has rendered. Always returns 0 in production. */
export const useRenderCount = (): number => {
    const count = React.useRef(0);
    if (process.env.NODE_ENV !== 'production') {
        count.current += 1;
    }
    return count.current;
};
