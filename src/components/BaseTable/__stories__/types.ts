export interface Item {
    id: string;
    parentId?: string | undefined;
    name: string;
    age: number;
    status?: 'free' | 'busy' | 'unknown';
}
