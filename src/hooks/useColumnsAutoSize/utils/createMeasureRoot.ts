import type * as React from 'react';

import * as ReactDOM from 'react-dom';

export interface MeasureRoot {
    render(element: React.ReactElement): void;
    unmount(): void;
}

type CreateRoot = (container: Element | DocumentFragment) => {
    render(children: React.ReactNode): void;
    unmount(): void;
};

type LegacyReactDOM = {
    render(element: React.ReactElement, container: Element): void;
    unmountComponentAtNode(container: Element): void;
};

let cachedCreateRoot: CreateRoot | null | undefined;

async function resolveCreateRoot(): Promise<CreateRoot | null> {
    if (cachedCreateRoot !== undefined) {
        return cachedCreateRoot;
    }

    try {
        // `react-dom/client` exists only in React 18+. In React 17 this subpath
        // is absent, so the dynamic import rejects and we fall back to the
        // legacy API below.
        const mod = (await import('react-dom/client')) as {createRoot?: CreateRoot};

        cachedCreateRoot = mod.createRoot ?? null;
    } catch {
        cachedCreateRoot = null;
    }

    return cachedCreateRoot;
}

export async function createMeasureRoot(container: HTMLElement): Promise<MeasureRoot> {
    const createRoot = await resolveCreateRoot();

    if (createRoot) {
        const root = createRoot(container);

        return {
            render: (element) => root.render(element),
            unmount: () => root.unmount(),
        };
    }

    const legacy = ReactDOM as unknown as LegacyReactDOM;

    return {
        render: (element) => legacy.render(element, container),
        unmount: () => legacy.unmountComponentAtNode(container),
    };
}
