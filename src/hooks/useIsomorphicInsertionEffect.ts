import * as React from 'react';

export const useIsomorphicInsertionEffect =
    typeof document === 'undefined' ? React.useEffect : React.useInsertionEffect;
