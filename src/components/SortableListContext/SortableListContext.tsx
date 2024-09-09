import React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

import type {useSortableList} from '../../hooks';

export interface SortableListContextValue extends ReturnType<typeof useSortableList> {
    enableNesting?: boolean;
    useSortable?: typeof useSortable;
}

export const SortableListContext = React.createContext<SortableListContextValue | undefined>(
    undefined,
);
