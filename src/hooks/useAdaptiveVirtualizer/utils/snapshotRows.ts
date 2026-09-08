import type {RenderedVirtualRow, Snapshot} from '../types';

export const snapshotRows = (rows: readonly RenderedVirtualRow[]): Snapshot => {
    const indexes = rows.map(({index}) => index);
    return {
        indexes,
        indexSet: new Set(indexes),
        realIndexSet: new Set(rows.filter(({deferred}) => !deferred).map(({index}) => index)),
    };
};
