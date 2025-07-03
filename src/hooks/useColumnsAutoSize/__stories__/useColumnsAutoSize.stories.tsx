import type {Meta, StoryObj} from '@storybook/react';

import {AutoSizedTable} from './AutoSizedTable';
import {TableWithDynamicData} from './TableWithDynamicData';
import {columns} from './constants/columns';
import {columnsWithComplexComponents} from './constants/columnsWithComplexComponents';
import {columnsWithPredefinedWidths} from './constants/columnsWithPredefinedWidths';
import {data} from './constants/data';
import {treeData} from './constants/treeData';

const meta: Meta<typeof AutoSizedTable> = {
    title: 'Hooks / useColumnsAutoSize',
    component: AutoSizedTable,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AutoSizedTable>;

export const Basic: Story = {
    args: {
        data,
        columns,
        enableColumnResizing: false,
        sampleSize: 100,
    },
};

export const WithResizing: Story = {
    args: {
        data,
        columns,
        enableColumnResizing: true,
        sampleSize: 100,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates columns with resizing enabled. You can drag the column edges to resize.',
            },
        },
    },
};

export const WithPredefinedWidths: Story = {
    args: {
        data,
        columns: columnsWithPredefinedWidths,
        enableColumnResizing: true,
        respectExistingWidths: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example shows how the hook respects predefined column widths. Age, Visits and Status columns have fixed widths.',
            },
        },
    },
};

export const SmallSample: Story = {
    args: {
        data,
        columns,
        enableColumnResizing: false,
        sampleSize: 3,
    },
    parameters: {
        docs: {
            description: {
                story: 'Using a small sample size (3 rows) for width calculation to improve performance with large datasets.',
            },
        },
    },
};

export const CustomWidthLimits: Story = {
    args: {
        data,
        columns,
        enableColumnResizing: true,
        minWidth: 100,
        maxWidth: 250,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example uses custom minimum (100px) and maximum (250px) width constraints.',
            },
        },
    },
};

export const DynamicData: Story = {
    render: TableWithDynamicData,
    args: {
        columns,
        data: [],
        enableColumnResizing: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates how column widths adapt when data changes.',
            },
        },
    },
};

export const ComplexComponents: Story = {
    args: {
        data,
        columns: columnsWithComplexComponents,
        enableColumnResizing: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates how the hook handles columns with complex React components.',
            },
        },
    },
};

export const Tree: Story = {
    args: {
        data: treeData,
        columns: columnsWithComplexComponents,
        enableExpanding: true,
        getSubRows: (item) => item.children,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates how the hook works with the tree table structure',
            },
        },
    },
};

export const LongText: Story = {
    args: {
        data: [
            ...data,
            {
                firstName:
                    'This is an extremely long first name that would normally cause issues with layout',
                lastName:
                    'This is also a very long last name that stretches across multiple columns potentially',
                age: 99,
                visits: 999,
                status: 'complicated' as const,
                progress: 50,
            },
        ],
        columns,
        enableColumnResizing: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'This example shows how the hook handles very long text content in cells.',
            },
        },
    },
};
