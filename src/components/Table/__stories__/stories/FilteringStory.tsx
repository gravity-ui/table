import * as React from 'react';

import {Button, TextInput} from '@gravity-ui/uikit';
import type {ColumnFiltersState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {data} from '../../../BaseTable/__stories__/constants/data';
import {Table} from '../../Table';
import {filterableColumns} from '../constants/filtering';

import {cnFilteringStory} from './FilteringStory.classname';

import './FilteringStory.scss';

export const FilteringStory = () => {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useTable({
        data,
        columns: filterableColumns,
        enableGlobalFilter: true,
        enableColumnFilters: true,
        state: {
            globalFilter,
            columnFilters,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getRowId: (row) => row.id,
    });

    const handleClearFilters = React.useCallback(() => {
        setGlobalFilter('');
        setColumnFilters([]);
    }, []);

    return (
        <div>
            <div className={cnFilteringStory('global-search')}>
                <h3 className={cnFilteringStory('title')}>Global Search</h3>
                <TextInput
                    placeholder="Search all columns..."
                    value={globalFilter}
                    onUpdate={setGlobalFilter}
                    size="m"
                    className={cnFilteringStory('input')}
                />
                <div className={cnFilteringStory('info')}>
                    Showing {table.getFilteredRowModel().rows.length} of {data.length} rows
                </div>
            </div>

            <div className={cnFilteringStory('controls')}>
                <Button onClick={handleClearFilters} view="outlined">
                    Clear All Filters
                </Button>
            </div>

            <Table table={table} />
        </div>
    );
};
