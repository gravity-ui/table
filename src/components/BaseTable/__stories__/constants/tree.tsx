import type {ColumnDef} from '../../../Table/types';
import {TreeExpandableCell} from '../../../TreeExpandableCell';
import {DraggableTreeNameCell} from '../cells/DraggableTreeNameCell';
import {TreeNameCell} from '../cells/TreeNameCell';
import type {Item} from '../types';

export interface TreeItem extends Item {
    children?: TreeItem[];
}

export function getColumns(styled = false): ColumnDef<TreeItem>[] {
    const NameCell = styled ? TreeExpandableCell : TreeNameCell;
    return [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 200,
            withNestingStyles: true,
            cell: (info) => <NameCell row={info.row}>{info.getValue<string>()}</NameCell>,
        },
        {accessorKey: 'age', header: 'Age', size: 100},
    ];
}

export const draggableTreeColumns: ColumnDef<TreeItem>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({getValue, row, table}) => (
            <DraggableTreeNameCell row={row} table={table} value={getValue<string>()} />
        ),
    },
    {accessorKey: 'age', header: 'Age', size: 100},
];

export const data: TreeItem[] = [
    {
        id: 'nick',
        name: 'Nick',
        age: 98,
        children: [
            {
                id: 'mike',
                name: 'Mike WithVery LongSurname',
                age: 55,
                children: [
                    {
                        id: 'lena',
                        name: 'Lena',
                        age: 30,
                        children: [
                            {
                                id: 'masha',
                                name: 'Masha',
                                age: 5,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'tom',
        name: 'Tom',
        age: 92,
    },
    {
        id: 'ann',
        name: 'Ann',
        age: 99,
        children: [
            {
                id: 'jeremy',
                name: 'Jeremy',
                age: 56,
                children: [
                    {
                        id: 'megan',
                        name: 'Megan',
                        age: 31,
                        children: [
                            {
                                id: 'ben',
                                name: 'Ben',
                                age: 3,
                            },
                            {
                                id: 'daniel',
                                name: 'Daniel',
                                age: 5,
                            },
                        ],
                    },
                    {
                        id: 'lauren',
                        name: 'Lauren',
                        age: 30,
                    },
                ],
            },
            {
                id: 'yanny',
                name: 'Yanny',
                age: 30,
            },
        ],
    },
    {
        id: 'john',
        name: 'John',
        age: 88,
    },
];

export type TreeGroupItem =
    | {
          id: string;
          name: string;
          items: TreeItem[];
      }
    | TreeItem;

export const groupsData = [
    {
        id: 'Friends',
        name: 'Friends',
        items: data,
    },
];

export const groupsColumns = getColumns() as ColumnDef<TreeGroupItem>[];
