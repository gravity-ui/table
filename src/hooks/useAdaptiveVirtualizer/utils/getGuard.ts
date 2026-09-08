export const getGuard = (overscan: number) =>
    overscan <= 0 ? 0 : Math.min(overscan, Math.max(4, Math.min(12, Math.ceil(overscan * 0.5))));
