export const appendUniqueIndexes = (indexes: readonly number[], suffix: readonly number[]) => {
    const result = [...indexes];
    const seen = new Set(indexes);
    for (const index of suffix) {
        if (!seen.has(index)) {
            seen.add(index);
            result.push(index);
        }
    }
    return result;
};
