import * as React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

export interface ColumnReorderingContextValue {
    /** Id of the column currently being dragged */
    activeColumnId: string | null;
    /** Id of the column the dragged column is currently hovered over */
    targetColumnId: string | null;
    useSortable?: typeof useSortable;
}

export const ColumnReorderingContext = React.createContext<
    ColumnReorderingContextValue | undefined
>(undefined);
