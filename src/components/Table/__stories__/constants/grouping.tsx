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
