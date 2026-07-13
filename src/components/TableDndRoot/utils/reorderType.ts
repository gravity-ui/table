import type {Active, Over} from '@dnd-kit/core';

import type {ReorderType} from '../types';

export function getReorderType(active: Active | null | undefined): ReorderType | undefined {
    return active?.data?.current?.reorderType as ReorderType | undefined;
}

export function getOverReorderType(over: Over | null | undefined): ReorderType | undefined {
    return over?.data?.current?.reorderType as ReorderType | undefined;
}
