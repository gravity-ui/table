import React from 'react';

import type {useSortableList} from '../../hooks';

type SortableListContextValue = ReturnType<typeof useSortableList>;

export const SortableListContext = React.createContext<SortableListContextValue | undefined>(
    undefined,
);
