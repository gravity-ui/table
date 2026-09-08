import type {MeasureRoot} from './createMeasureRoot';

export function disposeMeasureRoot(root: MeasureRoot, container: HTMLDivElement | null) {
    // A measurement root is nested outside the consumer's React tree. Waiting for the current
    // commit to finish avoids React 18's synchronous nested-root unmount warning.
    Promise.resolve().then(() => {
        root.unmount();
        container?.remove();
    });
}
