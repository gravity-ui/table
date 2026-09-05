export const createRange = (startIndex: number, endIndex: number) => {
    if (endIndex < startIndex) {
        return [];
    }
    return Array.from({length: endIndex - startIndex + 1}, (_, offset) => startIndex + offset);
};
