import type {
    AdaptiveRenderPlan,
    AdaptiveVirtualizerController,
} from '../../../hooks/useAdaptiveVirtualizer/types';

export function getAdaptiveRenderGeneration(
    controller: AdaptiveVirtualizerController | null | undefined,
    plan: AdaptiveRenderPlan | null | undefined,
) {
    return plan?.renderGeneration ?? controller?.getRenderGeneration() ?? 0;
}
