import * as React from 'react';

import type {DragEndEvent, DragStartEvent, UniqueIdentifier} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import type {ColumnDefTemplate} from '@tanstack/react-table';

import type {Column} from '../../types/base';

const filterColumns = <TData extends unknown>(
    column: Column<TData> | undefined,
): column is Column<TData> => Boolean(column);

const orderItem = <TData extends unknown>(
    item: Column<TData>,
    state: Record<string, string[]>,
): Column<TData> => {
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
    items: Column<TData>[],
    orderState: Record<string, string[]>,
    setOrderState: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
) => {
    const [activeDepth, setActiveDepth] = React.useState<number | undefined>();

    const depthMap = React.useMemo(() => {
        const stack = [...items];
        const result: Record<string, number> = {};

        while (stack.length) {
            const item = stack.pop();
            if (!item) continue;
            result[item.id] = item.depth;
            if (item.columns) stack.push(...item.columns);
        }

        return result;
    }, [items]);

    const orderedItems = React.useMemo(() => {
        return (
            orderState['root']
                .map((orderId) => items.find(({id}) => id === orderId))
                .filter(filterColumns)
                .map((item) => orderItem(item, orderState)) ?? []
        );
    }, [orderState, items]);

    const handleDragEnd = ({active, over}: DragEndEvent) => {
        setActiveDepth(undefined);
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

    const handleDragStart = ({active}: DragStartEvent) => {
        setActiveDepth(depthMap[active.id]);
    };

    const handleDragCancel = () => {
        setActiveDepth(undefined);
    };

    return {orderedItems, activeDepth, handleDragEnd, handleDragStart, handleDragCancel};
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
    treeItems: Column<TData>[],
    initialOrder: string[],
) => {
    const orderMap = Object.fromEntries(initialOrder.map((id, index) => [id, index]));

    const stack = [...treeItems];
    const result: Record<string, string[]> = {root: treeItems.map(({id}) => id)};
    const parentNodes: string[] = [];

    while (stack.length) {
        const item = stack.shift();
        if (!item) continue;
        result[item.id] = item?.columns?.map(({id}) => id) ?? [];
        if (item.columns.length) {
            stack.push(...item.columns);
            parentNodes.push(item.id);
        }
    }

    parentNodes.reverse().forEach((parent) => {
        const childs = result[parent];
        const childsOrders = childs.map((id) => orderMap[id] ?? -1);
        const minIndex = Math.min(...childsOrders);
        orderMap[parent] = minIndex;
    });

    Object.keys(result).forEach((key) => {
        result[key] = result[key].sort((a, b) => orderMap[a] - orderMap[b]);
    });

    return result;
};

export const isDisplayedColumn = <TData extends unknown>(column: Column<TData, unknown>) =>
    !column.columnDef.meta?.hideInSettings;

export const isFilteredColumn = <TProps extends object>(
    title: ColumnDefTemplate<TProps>,
    search: string,
) => (typeof title === 'string' ? title.toLowerCase().includes(search.toLowerCase()) : false);

export const getNestedColumnsCount = <TData extends unknown>(column: Column<TData>): number => {
    return column.columns
        ? column.columns.reduce((count, current) => {
              count++;
              if (current.columns.length > 0) {
                  return count + getNestedColumnsCount(current);
              }
              return count;
          }, 0)
        : 0;
};
