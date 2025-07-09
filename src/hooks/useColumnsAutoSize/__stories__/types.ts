export type Person = {
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: 'single' | 'relationship' | 'complicated' | 'married';
    progress: number;
    children?: Person[];
};
