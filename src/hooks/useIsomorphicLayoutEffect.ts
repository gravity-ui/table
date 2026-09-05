import * as React from 'react';

export const useIsomorphicLayoutEffect =
    typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;
