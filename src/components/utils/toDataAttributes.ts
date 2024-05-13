function toKebabCase(s: string) {
    return s.replace(/(^|[a-z])([A-Z])/g, (_, ...matches) =>
        matches[0] ? `${matches[0]}-${matches[1].toLowerCase()}` : matches[1].toLowerCase(),
    );
}

export function toDataAttributes(
    dataset?: Record<string, unknown>,
): Record<string, string> | undefined {
    if (!dataset) {
        return undefined;
    }

    const htmlAttrs: Record<string, string> = {};

    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const value = dataset[key];

            if (value !== null && value !== undefined) {
                htmlAttrs[`data-${toKebabCase(key)}`] = String(value);
            }
        }
    }

    return htmlAttrs;
}
