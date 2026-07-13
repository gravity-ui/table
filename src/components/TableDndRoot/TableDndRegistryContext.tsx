import * as React from 'react';

import type {TableDndRegistryContextValue} from './types';

export const TableDndRegistryContext = React.createContext<
    TableDndRegistryContextValue | undefined
>(undefined);
