export const uniqueValidIndexes = (indexes: readonly number[], count: number, sort = false) => {
    const result: number[] = [];
    const seen = new Set<number>();
    for (const index of indexes) {
        if (index >= 0 && index < count && !seen.has(index)) {
            seen.add(index);
            result.push(index);
        }
    }
    return sort ? result.sort((left, right) => left - right) : result;
};
