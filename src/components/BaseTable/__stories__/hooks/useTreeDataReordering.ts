import * as React from 'react';

import cloneDeep from 'lodash/cloneDeep';

import type {ReorderingProviderProps} from '../../../ReorderingProvider';
import type {TreeItem} from '../constants/tree';

export type UseTreeDataReorderingProps = {
    data: TreeItem[];
    setData: (data: TreeItem[]) => void;
};

type UpdateRankPayload = {
    parentId?: string;
    movedItemId: string;
    after?: string;
    before?: string;
};

export const useTreeDataReordering = ({data, setData}: UseTreeDataReorderingProps) => {
    return React.useCallback<NonNullable<ReorderingProviderProps<TreeItem>['onReorder']>>(
        // eslint-disable-next-line complexity
        ({
            draggedItemKey,
            baseItemKey,
            baseNextItemKey,
            targetItemKey,
            nextChild,
            pullFromParent,
        }) => {
            if (!draggedItemKey) {
                return;
            }

            let dataClone = cloneDeep(data);

            const itemsMap: Record<string, TreeItem> = {};
            const parents: Record<string, string> = {};
            const children: Record<string, string[]> = {};
            const order: string[] = [];

            const collectTreeItems = (items: TreeItem[]) => {
                for (const item of items) {
                    itemsMap[item.id] = item;
                    order.push(item.id);

                    if (item.children?.length) {
                        const childIds: string[] = [];

                        for (const child of item.children) {
                            parents[child.id] = item.id;
                            childIds.push(child.id);
                        }

                        children[item.id] = childIds;

                        collectTreeItems(item.children);
                    }
                }
            };

            collectTreeItems(dataClone);

            const draggedItem = itemsMap[draggedItemKey] as TreeItem;
            const baseItemParent = baseItemKey && parents[baseItemKey];
            const baseNextItemParent = baseNextItemKey && parents[baseNextItemKey];
            const isMovedAfterRoot = baseItemParent !== baseNextItemParent;

            const updateRank = ({parentId, movedItemId, after, before}: UpdateRankPayload) => {
                const movedItem = itemsMap[movedItemId] as TreeItem;

                const previousParentId = parents[movedItemId];
                if (previousParentId) {
                    const previousParent = itemsMap[previousParentId] as TreeItem;

                    previousParent.children = (previousParent.children as TreeItem[]).filter(
                        (child) => child.id !== movedItemId,
                    );
                } else {
                    dataClone = dataClone.filter((item) => item.id !== movedItemId);
                }

                const newParent = parentId && itemsMap[parentId];
                if (newParent) {
                    const newParentChildren = children[parentId] ?? [];

                    if (!newParent.children) {
                        newParent.children = [];
                    }

                    if (after) {
                        const index = newParentChildren.indexOf(after);
                        (newParent.children as TreeItem[]).splice(index, 0, movedItem);
                    } else if (before) {
                        const index = newParentChildren.indexOf(before);
                        (newParent.children as TreeItem[]).splice(index - 1, 0, movedItem);
                    }
                } else if (after) {
                    const index = dataClone.findIndex((item) => item.id === after);
                    dataClone.splice(index + 1, 0, movedItem);
                } else if (before) {
                    const index = dataClone.findIndex((item) => item.id === before);
                    dataClone.splice(index, 0, movedItem);
                }

                setData(dataClone);
            };

            const isFirstChild = (id: string) => {
                const parent = parents[id];

                if (!parent) {
                    return false;
                }

                const childrenIds = children[parent];

                if (!childrenIds) {
                    return false;
                }

                const childrenIndexById: Record<string, number> = {};

                for (const childrenId of childrenIds) {
                    childrenIndexById[childrenId] = order.indexOf(childrenId);
                }

                const childrenIdsOrdered = [...childrenIds];

                childrenIdsOrdered.sort(
                    (first, second) => childrenIndexById[first] - childrenIndexById[second],
                );

                return childrenIdsOrdered[0] === id;
            };

            // eslint-disable-next-line no-param-reassign
            pullFromParent =
                pullFromParent && (isMovedAfterRoot || Boolean(parents[baseItemKey as string]));

            // Put the moved item if it fells on another one or the entity in front of the pointer is an expanded entity
            const shouldInsertToTarget =
                !pullFromParent &&
                (targetItemKey ||
                    children[baseItemKey as string]?.includes(baseNextItemKey as string));

            if (shouldInsertToTarget) {
                const parentId = targetItemKey || baseItemKey;

                let movedItemId = draggedItemKey;

                // First child in the parent node
                if (!targetItemKey && baseItemKey) {
                    if (
                        parents[draggedItemKey] === baseItemKey ||
                        isFirstChild(baseNextItemKey as string)
                    ) {
                        updateRank({
                            parentId,
                            movedItemId,
                            before: itemsMap[baseNextItemKey as string].id,
                        });
                    } else {
                        movedItemId = baseNextItemKey as string;

                        updateRank({
                            parentId: parents[movedItemId],
                            movedItemId,
                            after: draggedItem.id,
                        });
                    }
                } else if (targetItemKey && !baseItemKey) {
                    if (parents[draggedItemKey] === targetItemKey || isFirstChild(targetItemKey)) {
                        updateRank({
                            parentId,
                            movedItemId,
                            before: itemsMap[targetItemKey]?.id,
                        });
                    } else {
                        updateRank({
                            parentId,
                            movedItemId,
                            after: itemsMap[targetItemKey]?.id,
                        });
                    }
                }
            } else {
                const isMovedAfterTree = pullFromParent
                    ? !isMovedAfterRoot
                    : !nextChild && isMovedAfterRoot;
                let parentId = baseItemParent;

                if (isMovedAfterTree) {
                    parentId = baseItemParent ? parents[baseItemParent] : undefined;
                }

                const base = isMovedAfterTree ? baseItemParent : baseItemKey;

                updateRank({
                    parentId,
                    movedItemId: draggedItemKey,
                    after: base ? itemsMap[base]?.id : undefined,
                    before: base ? undefined : itemsMap[baseNextItemKey as string]?.id,
                });
            }
        },
        [data, setData],
    );
};
