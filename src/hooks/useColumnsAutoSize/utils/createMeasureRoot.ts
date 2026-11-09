import type * as React from 'react';

import * as ReactDOM from 'react-dom';

export interface MeasureRoot {
    render(element: React.ReactElement | null): void;
    unmount(): void;
}

export async function createMeasureRoot(container: HTMLElement): Promise<MeasureRoot> {
    const {createRoot} = await import('react-dom/client');
    const root = createRoot(container);

    return {
        // Measurement must observe this commit, not a pending concurrent render.
        render: (element) => ReactDOM.flushSync(() => root.render(element)),
        unmount: () => root.unmount(),
    };
}
