import type {ColumnDef} from '@tanstack/react-table';

import type {Person} from '../types';

export const columnsWithPredefinedWidths: ColumnDef<Person>[] = [
    {
        accessorKey: 'firstName',
        header: 'First Name',
    },
    {
        accessorKey: 'lastName',
        header: 'Last Name',
    },
    {
        accessorKey: 'age',
        header: 'Age',
        size: 80,
    },
    {
        accessorKey: 'visits',
        header: 'Visits',
        size: 80,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        cell: (info) => (
            <span
                className={`status-${info.getValue<Person['status']>()}`}
                style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor:
                        info.getValue<Person['status']>() === 'single'
                            ? '#e5f5e0'
                            : info.getValue<Person['status']>() === 'married'
                              ? '#e0ecf5'
                              : info.getValue<Person['status']>() === 'relationship'
                                ? '#f5e0ec'
                                : '#f5f0e0',
                }}
            >
                {info.getValue<Person['status']>()}
            </span>
        ),
    },
    {
        accessorKey: 'progress',
        header: 'Profile Progress',
        cell: (info) => (
            <div style={{width: '100%', position: 'relative'}}>
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#f0f0f0',
                        height: '10px',
                        borderRadius: '5px',
                    }}
                >
                    <div
                        style={{
                            width: `${info.getValue<number>()}%`,
                            backgroundColor:
                                info.getValue<number>() < 40
                                    ? '#ff9999'
                                    : info.getValue<number>() < 70
                                      ? '#ffcc99'
                                      : '#99cc99',
                            height: '100%',
                            borderRadius: '5px',
                        }}
                    />
                </div>
                <div style={{textAlign: 'center', marginTop: '2px', fontSize: '0.8em'}}>
                    {info.getValue<number>()}%
                </div>
            </div>
        ),
    },
];
