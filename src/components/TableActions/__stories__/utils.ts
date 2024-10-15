import type {Item} from './types';

export const generateData = (length: number) => {
    return Array.from({length}, (_item, index) => ({
        id: index.toString(),
        name: ['John', 'Michael', 'Jane'][index % 3],
        age: (index * 2) % 100,
        status: ['free', 'busy', 'unknown'][index % 3],
    })) as Item[];
};
