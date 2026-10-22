import * as React from 'react';

import {TableDndRegistryContext} from './TableDndRegistryContext';
import {TableDndRoot} from './TableDndRoot';
import type {TableDndRegistryContextValue, TableDndScopeConfig} from './types';

export interface TableDndRegistryProviderProps {
    children?: React.ReactNode;
}

export const TableDndRegistryProvider = ({children}: TableDndRegistryProviderProps) => {
    const [scopes, setScopes] = React.useState<Record<string, TableDndScopeConfig>>({});

    const registerScope = React.useCallback((id: string, config: TableDndScopeConfig) => {
        setScopes((prevScopes) => ({...prevScopes, [id]: config}));
    }, []);

    const unregisterScope = React.useCallback((id: string) => {
        setScopes((prevScopes) => {
            const nextScopes = {...prevScopes};
            delete nextScopes[id];

            return nextScopes;
        });
    }, []);

    const contextValue = React.useMemo<TableDndRegistryContextValue>(
        () => ({registerScope, unregisterScope}),
        [registerScope, unregisterScope],
    );

    return (
        <TableDndRegistryContext.Provider value={contextValue}>
            <TableDndRoot scopes={scopes}>{children}</TableDndRoot>
        </TableDndRegistryContext.Provider>
    );
};
