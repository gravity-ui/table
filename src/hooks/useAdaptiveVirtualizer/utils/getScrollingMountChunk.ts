import {MAX_WARM_MOUNT_CHUNK_SIZE} from '../constants';

export const getScrollingMountChunk = (overscan: number) =>
    Math.max(1, Math.min(4, MAX_WARM_MOUNT_CHUNK_SIZE, Math.floor(overscan / 6)));
