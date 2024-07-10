import React from 'react';

import type {MeasuringConfiguration, Modifier} from '@dnd-kit/core';
import {
    DndContext,
    MeasuringStrategy,
    PointerSensor,
    rectIntersection,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

export interface SortableListDndContextProps {
    modifiers?: Modifier[];
    children?: React.ReactNode;
}

const measuring: MeasuringConfiguration = {
    droppable: {
        strategy: MeasuringStrategy.WhileDragging,
    },
};

export const SortableListDndContext = ({children, modifiers}: SortableListDndContextProps) => {
    const pointerSensor = useSensor(PointerSensor);
    const sensors = useSensors(pointerSensor);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            measuring={measuring}
            modifiers={modifiers}
        >
            {children}
        </DndContext>
    );
};
