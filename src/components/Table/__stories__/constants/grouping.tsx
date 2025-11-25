import type {ColumnDef} from '../../../../types/base';
import type {Item} from '../../../BaseTable/__stories__/types';
import {TreeExpandableCell} from '../../../TreeExpandableCell';

export interface Group {
    id: string;
    name: string;
    isGroupHeader: true;
    items: GroupOrItem[];
}

export type GroupOrItem = Group | Item;

export const columns: ColumnDef<GroupOrItem>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        withNestingStyles: true,
        cell: (info) => (
            <TreeExpandableCell row={info.row}>{info.getValue<string>()}</TreeExpandableCell>
        ),
    },
    {accessorKey: 'age', header: 'Age', size: 100},
];

export const data: GroupOrItem[] = [
    {
        id: 'me',
        name: 'Me',
        age: 25,
        status: 'free',
    },
    {
        id: 'friends',
        name: 'Friends',
        isGroupHeader: true,
        items: [
            {
                id: 'nick',
                name: 'Nick',
                age: 25,
                status: 'busy',
                items: [
                    {
                        id: 'john 1',
                        name: 'John',
                        age: 23,
                        status: 'free',
                    },
                    {
                        id: 'michael 1',
                        name: 'Michael',
                        age: 27,
                        status: 'busy',
                    },
                ],
            },
            {
                id: 'tom',
                name: 'Tom',
                age: 21,
                status: 'unknown',
            },
        ],
    },
    {
        id: 'relatives',
        name: 'Relatives',
        isGroupHeader: true,
        items: [
            {
                id: 'john 2',
                name: 'John',
                age: 23,
                status: 'free',
            },
            {
                id: 'michael 2',
                name: 'Michael',
                age: 27,
                status: 'busy',
            },
        ],
    },
];

export const generateLargeData = (): GroupOrItem[] => {
    const statuses: Array<'free' | 'busy' | 'unknown'> = ['free', 'busy', 'unknown'];
    const result: GroupOrItem[] = [];
    let itemCounter = 0;

    for (let groupIndex = 0; groupIndex < 50; groupIndex++) {
        const groupItems: GroupOrItem[] = [];

        // Each group has 100 items
        for (let itemIndex = 0; itemIndex < 100; itemIndex++) {
            const hasSubItems = itemIndex % 5 === 0; // Every 5th item has sub-items

            if (hasSubItems) {
                // Create an item with sub-items (2-3 levels deep)
                const subItems: Item[] = [];
                const subItemCount = 3 + (itemCounter % 3); // 3-5 sub-items

                for (let subIndex = 0; subIndex < subItemCount; subIndex++) {
                    const hasDeepSubItems = subIndex === 0; // First sub-item has even deeper items

                    if (hasDeepSubItems) {
                        const deepSubItems: Item[] = [];
                        const deepSubItemCount = 2 + (itemCounter % 2); // 2-3 deep sub-items

                        for (let deepIndex = 0; deepIndex < deepSubItemCount; deepIndex++) {
                            deepSubItems.push({
                                id: `item-${itemCounter++}`,
                                name: `Deep Item ${itemCounter}`,
                                age: 20 + (itemCounter % 50),
                                status: statuses[itemCounter % 3],
                            });
                        }

                        subItems.push({
                            id: `item-${itemCounter++}`,
                            name: `Sub Item ${itemCounter}`,
                            age: 20 + (itemCounter % 50),
                            status: statuses[itemCounter % 3],
                            items: deepSubItems,
                        } as Item);
                    } else {
                        subItems.push({
                            id: `item-${itemCounter++}`,
                            name: `Sub Item ${itemCounter}`,
                            age: 20 + (itemCounter % 50),
                            status: statuses[itemCounter % 3],
                        });
                    }
                }

                groupItems.push({
                    id: `item-${itemCounter++}`,
                    name: `Item ${itemCounter}`,
                    age: 20 + (itemCounter % 50),
                    status: statuses[itemCounter % 3],
                    items: subItems,
                } as Item);
            } else {
                groupItems.push({
                    id: `item-${itemCounter++}`,
                    name: `Item ${itemCounter}`,
                    age: 20 + (itemCounter % 50),
                    status: statuses[itemCounter % 3],
                });
            }
        }

        result.push({
            id: `group-${groupIndex}`,
            name: `Group ${groupIndex + 1}`,
            isGroupHeader: true,
            items: groupItems,
        });
    }

    return result;
};
