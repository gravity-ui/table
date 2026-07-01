import type {MeasuringConfiguration} from '@dnd-kit/core';
import {MeasuringStrategy} from '@dnd-kit/core';

export const measuring: MeasuringConfiguration = {
    droppable: {
        strategy: MeasuringStrategy.WhileDragging,
    },
};
