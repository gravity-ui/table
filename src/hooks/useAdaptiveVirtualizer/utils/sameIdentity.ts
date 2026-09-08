import type {DeferredIdentity} from '../types';

export const sameIdentity = (
    left: DeferredIdentity | undefined,
    right: DeferredIdentity | undefined,
) =>
    Boolean(
        left &&
            right &&
            Object.is(left.virtualKey, right.virtualKey) &&
            Object.is(left.rowKey, right.rowKey),
    );
