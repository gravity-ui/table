import type {Person} from '../types';

export const treeData: Person[] = [
    {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        visits: 10,
        status: 'single',
        progress: 66,
        children: [
            {
                firstName: 'Alexander',
                lastName: 'Smith-Johnson',
                age: 42,
                visits: 20,
                status: 'married',
                progress: 33,
            },
            {
                firstName: 'Emma',
                lastName: 'Wilson',
                age: 25,
                visits: 5,
                status: 'relationship',
                progress: 80,
                children: [
                    {
                        firstName: 'Michael',
                        lastName: 'Brown',
                        age: 38,
                        visits: 15,
                        status: 'complicated',
                        progress: 45,
                    },
                ],
            },
        ],
    },
    {
        firstName: 'Olivia',
        lastName: 'Garcia-Williams',
        age: 29,
        visits: 12,
        status: 'single',
        progress: 92,
        children: [
            {
                firstName: 'James',
                lastName: 'Miller',
                age: 33,
                visits: 8,
                status: 'married',
                progress: 70,
                children: [
                    {
                        firstName: 'Benjamin',
                        lastName: 'Rodriguez',
                        age: 45,
                        visits: 3,
                        status: 'complicated',
                        progress: 25,
                    },
                    {
                        firstName: 'Charlotte',
                        lastName: 'Martinez',
                        age: 31,
                        visits: 18,
                        status: 'relationship',
                        progress: 60,
                    },
                    {
                        firstName: 'Daniel',
                        lastName: 'Hernandez',
                        age: 36,
                        visits: 9,
                        status: 'married',
                        progress: 77,
                    },
                ],
            },
            {
                firstName: 'Sophia',
                lastName: 'Davis',
                age: 27,
                visits: 22,
                status: 'single',
                progress: 55,
            },
        ],
    },
];
