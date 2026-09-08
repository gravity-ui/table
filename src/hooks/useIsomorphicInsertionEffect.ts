import * as React from 'react';

// React 17 is still supported, so layout effect is the commit-time fallback.
export const useIsomorphicInsertionEffect =
    typeof document === 'undefined'
        ? React.useEffect
        : (React.useInsertionEffect ?? React.useLayoutEffect);
