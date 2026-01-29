import * as React from 'react';

import type {ColumnFiltersState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {data} from '../constants/data';
import {filterableColumns} from '../constants/filtering';

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

    const handleClearFilters = () => {
        setGlobalFilter('');
        setColumnFilters([]);
    };

    const handleNameFilterChange = (value: string) => {
        const newFilters = columnFilters.filter((f) => f.id !== 'name');
        if (value) {
            newFilters.push({id: 'name', value});
        }
        setColumnFilters(newFilters);
    };

    const handleStatusFilterChange = (value: string) => {
        const newFilters = columnFilters.filter((f) => f.id !== 'status');
        if (value) {
            newFilters.push({id: 'status', value});
        }
        setColumnFilters(newFilters);
    };

    const nameFilter = columnFilters.find((f) => f.id === 'name')?.value as string | undefined;
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as string | undefined;

    return (
        <div>
            <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Global Search:
                    <input
                        type="text"
                        placeholder="Search all columns..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        style={{marginLeft: '8px', padding: '4px'}}
                    />
                </label>
                <div style={{fontSize: '14px', color: '#666'}}>
                    Showing {table.getFilteredRowModel().rows.length} of {data.length} rows
                </div>
            </div>

            <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Filter by Name:
                    <input
                        type="text"
                        placeholder="Filter by name..."
                        value={nameFilter || ''}
                        onChange={(e) => handleNameFilterChange(e.target.value)}
                        style={{marginLeft: '8px', padding: '4px'}}
                    />
                </label>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Filter by Status:
                    <select
                        value={statusFilter || ''}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        style={{marginLeft: '8px', padding: '4px'}}
                    >
                        <option value="">All</option>
                        <option value="free">Free</option>
                        <option value="busy">Busy</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </label>
            </div>

            <div style={{marginBottom: '16px'}}>
                <button onClick={handleClearFilters} style={{padding: '4px 8px'}}>
                    Clear All Filters
                </button>
            </div>

            <BaseTable table={table} />
        </div>
    );
};
