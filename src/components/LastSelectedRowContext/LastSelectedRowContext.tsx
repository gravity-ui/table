import * as React from 'react';

export const LastSelectedRowContext = React.createContext<React.MutableRefObject<number | null>>({
    current: null,
});

export const LastSelectedRowContextProvider: React.FunctionComponent<React.PropsWithChildren> =
    React.memo(({children}) => {
        const lastSelectedRowIndexRef = React.useRef<number | null>(null);

        return (
            <LastSelectedRowContext.Provider value={lastSelectedRowIndexRef}>
                {children}
            </LastSelectedRowContext.Provider>
        );
    });

LastSelectedRowContextProvider.displayName = 'LastSelectedRowContextProvider';
