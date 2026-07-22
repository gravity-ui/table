import * as React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

import type {useSortableList} from '../../hooks';

export interface SortableListContextValue
    extends Omit<ReturnType<typeof useSortableList>, 'handlers'> {
    enableNesting?: boolean;
    useSortable?: typeof useSortable;
}

export const SortableListContext = React.createContext<SortableListContextValue | undefined>(
    undefined,
);
