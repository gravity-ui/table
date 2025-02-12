import type {Item} from './types';

export const generateData = (length: number) => {
    return Array.from({length}, (_item, index) => ({
        id: index.toString(),
        name: `Item ${index}`,
        age: (index * 2) % 100,
        status: ['free', 'busy', 'unknown'][index % 3],
    })) as Item[];
};
