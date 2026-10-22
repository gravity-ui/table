import * as React from 'react';

import {TableDndRegistryContext} from './TableDndRegistryContext';
import type {TableDndScopeConfig} from './types';

export interface TableDndScopeRegistrarProps {
    scopeId: string;
    config: TableDndScopeConfig;
}

export const TableDndScopeRegistrar = ({scopeId, config}: TableDndScopeRegistrarProps) => {
    const registry = React.useContext(TableDndRegistryContext);

    React.useLayoutEffect(() => {
        registry?.registerScope(scopeId, config);

        return () => {
            registry?.unregisterScope(scopeId);
        };
    }, [registry, scopeId, config]);

    return null;
};
