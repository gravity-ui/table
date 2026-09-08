export function areShallowEqual(previousValue: object | undefined, nextValue: object | undefined) {
    if (previousValue === nextValue) {
        return true;
    }
    if (!previousValue || !nextValue) {
        return false;
    }

    const previousRecord = previousValue as Record<string, unknown>;
    const nextRecord = nextValue as Record<string, unknown>;
    const nextKeys = Object.keys(nextRecord);
    return (
        Object.keys(previousRecord).length === nextKeys.length &&
        nextKeys.every((key) => previousRecord[key] === nextRecord[key])
    );
}
