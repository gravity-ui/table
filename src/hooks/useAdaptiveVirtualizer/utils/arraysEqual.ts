export const arraysEqual = (left: readonly number[], right: readonly number[]) =>
    left.length === right.length && left.every((item, index) => item === right[index]);
