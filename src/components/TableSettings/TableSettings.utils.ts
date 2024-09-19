import type {DragEndEvent} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import type {Column} from '@tanstack/react-table';

export const findContainer = (itemsMap: Record<string, string[]>, id?: string) => {
    if (!id) return undefined;
    return Object.keys(itemsMap).find((key) => itemsMap[key].includes(id));
};

export const useOrderedItems = <TData extends unknown>(
    items: Column<TData, unknown>[],
    orderState: Record<string, string[]>,
    setOrderState: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
) => {
    const orderItem = (
        item: Column<TData, unknown>,
        state: Record<string, string[]>,
    ): Column<TData, unknown> => {
        const childrenOrder = state[item.id] ?? [];
        const orderedChildren = childrenOrder
            .map((orderId) => item.columns?.find(({id}) => id === orderId))
            .filter(Boolean) as Column<TData, unknown>[];
        return {
            ...item,
            columns: orderedChildren?.map((child) => orderItem(child, state)) ?? [],
        };
    };

    const orderedItems =
        orderItem({id: 'root', columns: items} as Column<TData, unknown>, orderState).columns ?? [];

    const handleDragEnd = ({active, over}: DragEndEvent) => {
        const activeContainer = findContainer(orderState, active.id as string);
        const overContainer = findContainer(orderState, over?.id as string);
        if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

        const activeIndex = orderState[activeContainer].indexOf(active.id as string);
        const overIndex = orderState[overContainer].indexOf(over?.id as string);

        if (activeIndex !== overIndex) {
            setOrderState((prevState) => ({
                ...prevState,
                [overContainer]: arrayMove(orderState[overContainer], activeIndex, overIndex),
            }));
        }
    };

    return {orderedItems, handleDragEnd};
};

export const orderStateToColumnOrder = (state: Record<string, string[]>) => {
    const result = [];
    const stack = [...state['root']];

    while (stack.length) {
        const item = stack.shift();
        if (!item) continue;
        const children = state[item];

        if (children.length) stack.unshift(...children);
        else result.push(item);
    }
    return result;
};

export const getInitialOrderItems = <TData extends unknown>(
    treeItems: Column<TData, unknown>[],
) => {
    const stack = [...treeItems];
    const result: Record<string, string[]> = {root: treeItems.map(({id}) => id)};

    while (stack.length) {
        const item = stack.shift();
        if (!item) continue;
        result[item.id] = item?.columns?.map(({id}) => id) ?? [];
        if (item.columns) stack.push(...item.columns);
    }

    return result;
};
