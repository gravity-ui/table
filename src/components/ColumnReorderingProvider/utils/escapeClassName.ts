export function escapeClassName(className: string) {
    return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(className)
        : className;
}
