export const coversIndexes = (
    indexes: readonly number[],
    available: ReadonlySet<number> | undefined,
) => Boolean(available && indexes.every((index) => available.has(index)));
