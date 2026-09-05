export const createVersionedCallback = <TArgs extends unknown[], TResult>(
    callback: (...args: TArgs) => TResult,
    _version: number,
) => callback;
