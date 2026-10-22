import type {
    AdaptivePreparedData,
    AdaptivePreparedIndexes,
    AdaptiveVirtualizerController,
} from '../../../hooks/useAdaptiveVirtualizer/types';

export function commitAdaptiveData(
    controller: AdaptiveVirtualizerController | null | undefined,
    data: AdaptivePreparedData | undefined,
    requiredIndexes: AdaptivePreparedIndexes | undefined,
) {
    if (!controller || !data || !requiredIndexes) {
        return;
    }
    controller.commitRequiredIndexes(requiredIndexes);
    controller.commitData(data);
    controller.flushMeasurements();
}
