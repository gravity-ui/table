export function createTableRenderVersion(
    options: Readonly<Record<string, unknown>>,
    state: Readonly<Record<string, unknown>>,
    columnGeometry: string,
) {
    const version: Record<string, unknown> = {__columnGeometry: columnGeometry};

    Object.entries(options).forEach(([key, value]) => {
        if (key !== 'state') {
            version[`option:${key}`] = value;
        }
    });
    Object.entries(state).forEach(([key, value]) => {
        version[`state:${key}`] = value;
    });

    return version;
}
