import * as React from 'react';

import type {useSortable} from '@dnd-kit/sortable';

export type DraggableRowContextValue = Pick<
    ReturnType<typeof useSortable>,
    'attributes' | 'listeners' | 'setActivatorNodeRef'
>;

// Handles share the row's registration: a second useSortable with the same id can
// replace its DOM ref when virtualized cells mount after the row.
export const DraggableRowContext = React.createContext<DraggableRowContextValue | null>(null);
