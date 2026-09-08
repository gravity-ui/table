export const scheduleMicrotask =
    typeof queueMicrotask === 'function'
        ? queueMicrotask
        : (callback: () => void) => Promise.resolve().then(callback);
