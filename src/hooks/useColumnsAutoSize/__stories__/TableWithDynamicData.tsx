import * as React from 'react';

import {AutoSizedTable} from './AutoSizedTable';
import type {AutoSizedTableProps} from './AutoSizedTable';
import {data} from './constants/data';
import type {Person} from './types';

export type TableWithDynamicDataProps = Omit<AutoSizedTableProps, 'data'>;

export const TableWithDynamicData = (props: TableWithDynamicDataProps) => {
    const [currentData, setCurrentData] = React.useState(data);

    const generateNewData = () => {
        const firstNames = [
            'John',
            'Emma',
            'Michael',
            'Olivia',
            'James',
            'Sophia',
            'William',
            'Amelia',
            'Benjamin',
            'Charlotte',
        ];
        const lastNames = [
            'Smith',
            'Johnson',
            'Williams',
            'Brown',
            'Jones',
            'Garcia',
            'Miller',
            'Davis',
            'Rodriguez',
            'Martinez',
        ];
        const statuses = ['single', 'relationship', 'complicated', 'married'] as Person['status'][];

        return Array(10)
            .fill(null)
            .map(() => ({
                firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
                age: Math.floor(Math.random() * 40) + 20,
                visits: Math.floor(Math.random() * 30),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                progress: Math.floor(Math.random() * 100),
            }));
    };

    return (
        <div>
            <button
                onClick={() => setCurrentData(generateNewData())}
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Generate New Data
            </button>

            <AutoSizedTable {...props} data={currentData} />
        </div>
    );
};
