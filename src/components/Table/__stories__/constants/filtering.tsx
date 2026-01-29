import {Select, TextInput} from '@gravity-ui/uikit';
import type {SelectOption} from '@gravity-ui/uikit';

import type {ColumnDef} from '../../../../types/base';
import type {Item} from '../../../BaseTable/__stories__/types';
import {cnFilteringStory} from '../stories/FilteringStory.classname';

export const statusOptions: SelectOption[] = [
    {value: '', content: 'All'},
    {value: 'free', content: 'Free'},
    {value: 'busy', content: 'Busy'},
    {value: 'unknown', content: 'Unknown'},
];

export const filterableColumns: ColumnDef<Item>[] = [
    {
        id: 'name',
        header: ({column}) => (
            <div>
                <div className={cnFilteringStory('column-header')}>Name</div>
                <TextInput
                    value={(column.getFilterValue() as string) || ''}
                    onUpdate={(value) => column.setFilterValue(value)}
                    placeholder="Filter by name..."
                    size="s"
                />
            </div>
        ),
        accessorKey: 'name',
        filterFn: 'includesString',
        size: 200,
    },
    {
        id: 'age',
        header: 'Age',
        accessorKey: 'age',
        size: 100,
    },
    {
        id: 'status',
        header: ({column}) => (
            <div>
                <div className={cnFilteringStory('column-header')}>Status</div>
                <Select
                    value={[(column.getFilterValue() as string) || '']}
                    onUpdate={(values) => column.setFilterValue(values[0] || undefined)}
                    options={statusOptions}
                    size="s"
                    width="max"
                />
            </div>
        ),
        accessorKey: 'status',
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            return row.getValue(columnId) === filterValue;
        },
        size: 150,
    },
];
