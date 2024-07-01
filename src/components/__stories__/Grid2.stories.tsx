import React from 'react';

import type {Meta, StoryFn} from '@storybook/react';

import {Table} from '../Table';

import {cnGridDemo} from './GridDemo.classname';
import {GroupingDemo} from './GroupingDemo';
import {GroupingDemo2} from './GroupingDemo2';
import {GroupingWithSelectionDemo} from './GroupingWithSelectionDemo';
import {ReorderingDemo} from './ReorderingDemo';
import {ReorderingTreeDemo} from './ReorderingTreeDemo';
import {SortingDemo} from './SortingDemo';
import {TreeDemo} from './TreeDemo';
import {TreeWithGroupsDemo} from './TreeWithGroupsDemo';
import {VirtualizationDemo} from './VirtualizationDemo';
import {WindowVirtualizationDemo} from './WindowVirtualizationDemo';
import {WithSelectionDemo} from './WithSelectionDemo';
import {columns} from './constants/columns';
import {data} from './constants/data';
import type {Item} from './types';
import {generateData} from './utils';

import './GridDemo.scss';

export default {
    title: 'Table',
    component: Table,
} as Meta<typeof Table>;

const Template: StoryFn<typeof Table<Item>> = (args) => <Table {...args} />;

export const Default: StoryFn<typeof Table<Item>> = Template.bind({});

Default.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    onSelectedChange: undefined,
    onRowClick: undefined,
};

export const WithoutHeader: StoryFn<typeof Table<Item>> = Template.bind({});

WithoutHeader.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    withHeader: false,
    onSelectedChange: undefined,
    onRowClick: undefined,
};

export const HeaderGroups: StoryFn<typeof Table<Item>> = Template.bind({});

HeaderGroups.args = {
    data,
    columns: [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
        },
        {
            id: 'columns-parent',
            header: 'Columns header',
            columns: [
                {
                    id: 'columns',
                    header: 'Columns',
                    columns,
                },
            ],
        },
        {
            id: 'actions',
            header: 'Actions',
            accessorKey: 'id',
            columns: [
                {
                    id: 'edit',
                    header: 'Edit',
                    accessorKey: 'id',
                },
                {
                    id: 'delete',
                    header: 'Delete',
                    accessorKey: 'id',
                },
            ],
        },
    ],
    getRowId: (item: Item) => item.id,
    onSelectedChange: undefined,
    onRowClick: undefined,
    className: cnGridDemo('header-groups-grid'),
};

const WithSelectionTemplate: StoryFn<typeof Table<Item>> = (args) => (
    <WithSelectionDemo {...args} />
);

export const WithSelection: StoryFn<typeof Table<Item>> = WithSelectionTemplate.bind({});

WithSelection.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    onRowClick: undefined,
};

const SortingTemplate: StoryFn<typeof Table<Item>> = (args) => <SortingDemo {...args} />;

export const Sorting: StoryFn<typeof Table<Item>> = SortingTemplate.bind({});

Sorting.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    onRowClick: undefined,
    onSelectedChange: undefined,
};

const GroupingTemplate: StoryFn = () => <GroupingDemo />;
const GroupingTemplate2: StoryFn = () => <GroupingDemo2 />;

export const Grouping: StoryFn = GroupingTemplate.bind({});
export const Grouping2: StoryFn = GroupingTemplate2.bind({});

const GroupingWithSelectionTemplate: StoryFn = () => <GroupingWithSelectionDemo />;

export const GroupingWithSelection: StoryFn = GroupingWithSelectionTemplate.bind({});

const TreeTemplate: StoryFn = () => <TreeDemo />;

export const Tree: StoryFn = TreeTemplate.bind({});

const TreeWithGroupsTemplate: StoryFn = () => <TreeWithGroupsDemo />;

export const TreeWithGroups: StoryFn = TreeWithGroupsTemplate.bind({});

const ReorderingTemplate: StoryFn<typeof Table<Item>> = (args) => <ReorderingDemo {...args} />;

export const Reordering: StoryFn<typeof Table<Item>> = ReorderingTemplate.bind({});

Reordering.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    onRowClick: undefined,
    onSelectedChange: undefined,
};

const ReorderingTreeTemplate: StoryFn = () => <ReorderingTreeDemo />;

export const ReorderingTree: StoryFn = ReorderingTreeTemplate.bind({});

const VirtualizationTemplate: StoryFn<typeof Table<Item>> = (args) => (
    <VirtualizationDemo {...args} />
);

export const Virtualization: StoryFn<typeof Table<Item>> = VirtualizationTemplate.bind({});

Virtualization.args = {
    data: generateData(300),
    columns,
    getRowId: (item: Item) => item.id,
    onRowClick: undefined,
    onSelectedChange: undefined,
};

const WindowVirtualizationTemplate: StoryFn<typeof Table<Item>> = (args) => (
    <WindowVirtualizationDemo {...args} />
);

export const WindowVirtualization: StoryFn<typeof Table<Item>> = WindowVirtualizationTemplate.bind(
    {},
);

WindowVirtualization.args = {
    data: generateData(300),
    columns,
    getRowId: (item: Item) => item.id,
    onRowClick: undefined,
    onSelectedChange: undefined,
};

export const Resizing: StoryFn<typeof Table<Item>> = Template.bind({});

Resizing.args = {
    data,
    columns,
    getRowId: (item: Item) => item.id,
    onSelectedChange: undefined,
    onRowClick: undefined,
    onColumnSizingChange: undefined,
    onColumnSizingInfoChange: undefined,
    enableColumnResizing: true,
};
