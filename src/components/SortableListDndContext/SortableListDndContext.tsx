import type * as React from 'react';

import type {Modifier} from '@dnd-kit/core';

export interface SortableListDndContextProps {
    modifiers?: Modifier[];
    children?: React.ReactNode;
}

/**
 * @deprecated SortableList now owns the shared TableDndRoot context.
 * This component is kept as a passthrough for internal backward compatibility.
 */
export const SortableListDndContext = ({children}: SortableListDndContextProps) => children;
