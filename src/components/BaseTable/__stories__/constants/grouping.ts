import type {ColumnDef} from '../../../../types/tanstack';
import type {Item} from '../types';

export interface Group {
    id: string;
    name: string;
    items: Item[];
}

export type GroupOrItem = Group | Item;

export const columns: ColumnDef<GroupOrItem>[] = [
    {accessorKey: 'name', header: 'Name', size: 200},
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
        items: [
            {
                id: 'nick',
                name: 'Nick',
                age: 25,
                status: 'busy',
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
        items: [
            {
                id: 'john',
                name: 'John',
                age: 23,
                status: 'free',
            },
            {
                id: 'michael',
                name: 'Michael',
                age: 27,
                status: 'busy',
            },
        ],
    },
];
