import React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

import type {useSortableList} from '../../hooks';

type SortableListContextValue = ReturnType<typeof useSortableList> & {
    useSortable?: typeof useSortable;
};

export const SortableListContext = React.createContext<SortableListContextValue | undefined>(
    undefined,
);
