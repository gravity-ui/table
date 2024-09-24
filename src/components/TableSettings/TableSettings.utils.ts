import React from 'react';

import type {DragEndEvent, UniqueIdentifier} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import type {Column} from '@tanstack/react-table';

const filterColumns = <TData extends unknown>(
    column: Column<TData, unknown> | undefined,
): column is Column<TData, unknown> => Boolean(column);

const orderItem = <TData extends unknown>(
    item: Column<TData, unknown>,
    state: Record<string, string[]>,
): Column<TData, unknown> => {
    const childrenOrder = state[item.id] ?? [];
    const orderedChildren = childrenOrder
        .map((orderId) => item.columns?.find(({id}) => id === orderId))
        .filter(filterColumns);
    return {
        ...item,
        columns: orderedChildren?.map((child) => orderItem(child, state)) ?? [],
    };
};

export const findContainer = (itemsMap: Record<string, string[]>, id?: UniqueIdentifier) => {
    if (!id) return undefined;
    return Object.keys(itemsMap).find((key) => itemsMap[key].includes(id.toString()));
};

export const useOrderedItems = <TData extends unknown>(
    items: Column<TData, unknown>[],
    orderState: Record<string, string[]>,
    setOrderState: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
) => {
    const orderedItems = React.useMemo(() => {
        return (
            orderState['root']
                .map((orderId) => items.find(({id}) => id === orderId))
                .filter(filterColumns)
                .map((item) => orderItem(item, orderState)) ?? []
        );
    }, [orderState, items]);

    const handleDragEnd = ({active, over}: DragEndEvent) => {
        const activeContainer = findContainer(orderState, active.id);
        const overContainer = findContainer(orderState, over?.id);
        if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

        const activeIndex = orderState[activeContainer].indexOf(active.id.toString());
        const overIndex = over ? orderState[overContainer].indexOf(over?.id.toString()) : -1;

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
