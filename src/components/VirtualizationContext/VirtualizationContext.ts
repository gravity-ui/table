import React from 'react';

import type {VirtualItem} from '@tanstack/react-virtual';

interface TableVirtualizationContextValue {
    virtualItems: VirtualItem[];
    totalSize: number;
    measureRow: (node: HTMLTableRowElement | null) => void;
}

export const VirtualizationContext = React.createContext<
    TableVirtualizationContextValue | undefined
>(undefined);
