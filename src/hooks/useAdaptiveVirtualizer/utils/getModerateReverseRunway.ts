import {MAX_MODERATE_REVERSE_RUNWAY_ROWS} from '../constants';

import {getGuard} from './getGuard';

export const getModerateReverseRunway = (overscan: number) =>
    Math.max(2, getGuard(overscan), Math.min(overscan, MAX_MODERATE_REVERSE_RUNWAY_ROWS));
