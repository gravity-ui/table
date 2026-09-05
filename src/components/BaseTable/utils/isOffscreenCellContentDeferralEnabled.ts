export function isOffscreenCellContentDeferralEnabled(
    hasDeferralPredicate: boolean,
    hasAdaptiveController: boolean,
    directDomUpdates: boolean,
) {
    return hasDeferralPredicate && hasAdaptiveController && directDomUpdates;
}
