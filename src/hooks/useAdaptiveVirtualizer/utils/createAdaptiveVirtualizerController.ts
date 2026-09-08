import type {Range} from '@tanstack/react-virtual';

import {
    IDLE_TRIM_GRACE_MS,
    IDLE_WARM_UNMOUNT_CHUNK_SIZE,
    MAX_DIRECTIONAL_RUNWAY_ROWS,
    MAX_DIRECTIONAL_RUNWAY_VIEWPORTS,
    MAX_NATIVE_SETTLED_REALIZATION_CHUNK_SIZE,
    MAX_PENDING_PROPOSALS,
    MAX_REALIZATION_CHUNK_SIZE,
    MAX_RECOVERY_WARM_MOUNT_CHUNK_SIZE,
    MAX_SCROLL_SAMPLE_INTERVAL_MS,
    MAX_STABLE_REALIZATION_CHUNK_SIZE,
    MAX_WARM_MOUNT_CHUNK_SIZE,
    MIN_WARM_MOUNT_CHUNK_SIZE,
    SCROLL_LOOKAHEAD_MS,
    SCROLL_VELOCITY_ALPHA,
    STABLE_REALIZATION_DELAY_MS,
    URGENT_RUNWAY_SAFETY_ROWS,
    WARM_UNMOUNT_CHUNK_SIZE,
} from '../constants';
import type {
    AdaptiveControllerEnvironment,
    AdaptiveDataRow,
    AdaptiveMotionPlan,
    AdaptiveNotify,
    AdaptiveRangeState,
    AdaptiveRecoveryState,
    AdaptiveScrollDirection,
    AdaptiveTraceEvent,
    AdaptiveVirtualizerConfig,
    AdaptiveVirtualizerController,
    DeferredIdentity,
    DirectionalSample,
    ExtractionStateSnapshot,
    NativeSettledToken,
    PaintTicket,
    ProposalEffects,
    PublicRowVirtualizer,
    RangeProposal,
    Snapshot,
    TracePayload,
    VirtualItemKey,
} from '../types';

import {appendUniqueIndexes} from './appendUniqueIndexes';
import {arraysEqual} from './arraysEqual';
import {coversIndexes} from './coversIndexes';
import {coversRange} from './coversRange';
import {createBrowserScheduler} from './createBrowserScheduler';
import {createRange} from './createRange';
import {distanceToRange} from './distanceToRange';
import {getContiguousCoverageWindow} from './getContiguousCoverageWindow';
import {getDefaultIndexes} from './getDefaultIndexes';
import {getDirectionalWindow} from './getDirectionalWindow';
import {getGuard} from './getGuard';
import {getModerateReverseRunway} from './getModerateReverseRunway';
import {getRecoveryOutputLimit} from './getRecoveryOutputLimit';
import {getScrollingDomLimit} from './getScrollingDomLimit';
import {getScrollingMountChunk} from './getScrollingMountChunk';
import {isInsideSafeArea} from './isInsideSafeArea';
import {prioritize} from './prioritize';
import {sameIdentity} from './sameIdentity';
import {snapshotRows} from './snapshotRows';
import {uniqueValidIndexes} from './uniqueValidIndexes';

export const createAdaptiveVirtualizerController = (
    environment: AdaptiveControllerEnvironment = {},
): AdaptiveVirtualizerController => {
    const scheduler = environment.scheduler ?? createBrowserScheduler();
    let config: AdaptiveVirtualizerConfig = {
        adaptive: false,
        count: 0,
        enabled: true,
        lanes: 1,
        overscan: 1,
    };
    let virtualizer: PublicRowVirtualizer | null = null;
    let notify: AdaptiveNotify | null = null;
    let latestRange: Pick<Range, 'startIndex' | 'endIndex'> | null = null;
    let committed: Snapshot | null = null;
    let outputIndexes: number[] = [];
    let dataRows: readonly AdaptiveDataRow[] | null = null;
    let dataKeys: VirtualItemKey[] = [];
    let dataGetItemKey: ((index: number) => VirtualItemKey) | null = null;
    let dataLanes = 1;
    let deferred = new Map<number, DeferredIdentity>();
    let paintedDeferred = new Map<number, DeferredIdentity>();
    let measurementGeneration = 0;
    let renderGeneration = 0;
    let hardGeneration = 0;
    let flushedHardGeneration = 0;
    let hardTargetIndexes: number[] | null = null;
    let measurementResetPending = false;
    let measurementRefreshPending = false;
    let frameRelease: (() => void) | null = null;
    let idleTrimRelease: (() => void) | null = null;
    let stableRealizationRelease: (() => void) | null = null;
    let idleTrimReady = false;
    let disposed = false;
    let lifecycle = 0;
    let traceSequence = 0;
    let ticketSequence = 0;
    let paintTicket: PaintTicket | null = null;
    let nativeSettled: NativeSettledToken | null = null;
    let boundedRecovery = false;
    let customRangePassThrough = false;
    let pinnedIndexes: number[] = [];
    let revision = 0;
    let proposalSequence = 0;
    let activeProposalId: number | null = null;
    let draftEffects: ProposalEffects | null = null;
    const proposals = new Map<number, RangeProposal>();

    const invalidatePendingProposals = () => {
        revision += 1;
        activeProposalId = null;
    };

    let lastScrollOffset: number | null = null;
    let lastScrollTimestamp: number | null = null;
    let lastMotionDirection: AdaptiveScrollDirection = null;
    let lastActiveDirection: AdaptiveScrollDirection = null;
    let lastActualMotionOffset: number | null = null;
    let lastActualMotionTimestamp: number | null = null;
    let lastActualMotionDirection: AdaptiveScrollDirection = null;
    let recentDirectionalSample: DirectionalSample | null = null;
    let scrollVelocity = 0;
    let directionReversed = false;

    const getKey = (index: number) => config.getItemKey?.(index) ?? index;

    const cloneSnapshot = (snapshot: Snapshot | null): Snapshot | null =>
        snapshot
            ? {
                  indexes: [...snapshot.indexes],
                  indexSet: new Set(snapshot.indexSet),
                  realIndexSet: new Set(snapshot.realIndexSet),
              }
            : null;

    const captureExtractionState = (): ExtractionStateSnapshot => ({
        boundedRecovery,
        committed: cloneSnapshot(committed),
        config: {...config},
        customRangePassThrough,
        deferred: new Map(deferred),
        directionReversed,
        hardGeneration,
        hardTargetIndexes: hardTargetIndexes ? [...hardTargetIndexes] : null,
        idleTrimReady,
        lastActiveDirection,
        lastActualMotionDirection,
        lastActualMotionOffset,
        lastActualMotionTimestamp,
        lastMotionDirection,
        lastScrollOffset,
        lastScrollTimestamp,
        latestRange: latestRange ? {...latestRange} : null,
        measurementRefreshPending,
        nativeSettled: nativeSettled ? {...nativeSettled} : null,
        outputIndexes: [...outputIndexes],
        paintedDeferred: new Map(paintedDeferred),
        paintTicket,
        recentDirectionalSample: recentDirectionalSample ? {...recentDirectionalSample} : null,
        renderGeneration,
        requiredIndexes: [...pinnedIndexes],
        scrollVelocity,
    });

    const restoreExtractionState = (snapshot: ExtractionStateSnapshot) => {
        boundedRecovery = snapshot.boundedRecovery;
        committed = cloneSnapshot(snapshot.committed);
        config = {...snapshot.config};
        customRangePassThrough = snapshot.customRangePassThrough;
        deferred = new Map(snapshot.deferred);
        directionReversed = snapshot.directionReversed;
        hardGeneration = snapshot.hardGeneration;
        hardTargetIndexes = snapshot.hardTargetIndexes ? [...snapshot.hardTargetIndexes] : null;
        idleTrimReady = snapshot.idleTrimReady;
        lastActiveDirection = snapshot.lastActiveDirection;
        lastActualMotionDirection = snapshot.lastActualMotionDirection;
        lastActualMotionOffset = snapshot.lastActualMotionOffset;
        lastActualMotionTimestamp = snapshot.lastActualMotionTimestamp;
        lastMotionDirection = snapshot.lastMotionDirection;
        lastScrollOffset = snapshot.lastScrollOffset;
        lastScrollTimestamp = snapshot.lastScrollTimestamp;
        latestRange = snapshot.latestRange ? {...snapshot.latestRange} : null;
        measurementRefreshPending = snapshot.measurementRefreshPending;
        nativeSettled = snapshot.nativeSettled ? {...snapshot.nativeSettled} : null;
        outputIndexes = [...snapshot.outputIndexes];
        paintedDeferred = new Map(snapshot.paintedDeferred);
        paintTicket = snapshot.paintTicket;
        recentDirectionalSample = snapshot.recentDirectionalSample
            ? {...snapshot.recentDirectionalSample}
            : null;
        renderGeneration = snapshot.renderGeneration;
        pinnedIndexes = [...snapshot.requiredIndexes];
        scrollVelocity = snapshot.scrollVelocity;
    };

    const emitTrace = (event: TracePayload) => {
        if (!config.debugTrace) {
            return;
        }
        try {
            config.debugTrace({
                ...event,
                direction: virtualizer?.scrollDirection ?? lastActiveDirection,
                hardGeneration,
                offset: virtualizer?.scrollOffset ?? null,
                range: latestRange ? {...latestRange} : null,
                renderGeneration,
                sequence: ++traceSequence,
                timestamp: scheduler.now(),
            } as AdaptiveTraceEvent);
        } catch {
            // Diagnostics must never influence virtualization scheduling.
        }
    };

    const trace = (event: TracePayload) => {
        if (draftEffects) {
            draftEffects.traces.push(event);
            return;
        }
        emitTrace(event);
    };

    const setDeferred = (next: Map<number, DeferredIdentity>) => {
        const changed =
            next.size !== deferred.size ||
            [...next].some(([index, identity]) => !sameIdentity(identity, deferred.get(index)));
        if (!changed) {
            return false;
        }
        deferred = next;
        paintedDeferred = new Map(
            [...paintedDeferred].filter(([index, identity]) =>
                sameIdentity(identity, next.get(index)),
            ),
        );
        renderGeneration += 1;
        return true;
    };

    const cancelFrame = () => {
        if (draftEffects) {
            draftEffects.cancelFrame = true;
            return;
        }
        frameRelease?.();
        frameRelease = null;
    };

    const scheduleFrame = () => {
        if (draftEffects) {
            if (!disposed && (!frameRelease || draftEffects.cancelFrame)) {
                draftEffects.scheduleFrame = true;
            }
            return;
        }
        if (disposed || frameRelease || !notify) {
            return;
        }
        frameRelease = scheduler.requestFrame(() => {
            frameRelease = null;
            if (!disposed) {
                notify?.(false);
            }
        });
    };

    const cancelIdleTrim = () => {
        if (draftEffects) {
            draftEffects.cancelIdleTrim = true;
            idleTrimReady = false;
            return;
        }
        idleTrimRelease?.();
        idleTrimRelease = null;
        idleTrimReady = false;
    };

    const scheduleIdleTrim = () => {
        if (draftEffects) {
            if (
                !disposed &&
                (!idleTrimRelease || draftEffects.cancelIdleTrim) &&
                !idleTrimReady &&
                !virtualizer?.isScrolling
            ) {
                draftEffects.scheduleIdleTrim = true;
            }
            return;
        }
        if (disposed || idleTrimRelease || idleTrimReady || virtualizer?.isScrolling) {
            return;
        }
        idleTrimRelease = scheduler.setTimer(() => {
            idleTrimRelease = null;
            idleTrimReady = true;
            invalidatePendingProposals();
            scheduleFrame();
        }, IDLE_TRIM_GRACE_MS);
    };

    const cancelStableRealization = () => {
        if (draftEffects) {
            draftEffects.cancelStableRealization = true;
            return;
        }
        stableRealizationRelease?.();
        stableRealizationRelease = null;
    };

    const cancelPaintTicket = (reason: string) => {
        if (!paintTicket) {
            return;
        }
        const ticket = paintTicket;
        paintTicket = null;
        if (draftEffects) {
            draftEffects.cancelPaintTicketReason = reason;
        } else {
            ticket.cancel?.();
        }
        trace({event: 'paint_ticket_cancel', reason, ticketId: ticket.id});
    };

    const invalidateNativeSettled = () => {
        nativeSettled = null;
    };

    const resetMotion = () => {
        lastScrollOffset = null;
        lastScrollTimestamp = null;
        lastMotionDirection = null;
        lastActiveDirection = null;
        lastActualMotionOffset = null;
        lastActualMotionTimestamp = null;
        lastActualMotionDirection = null;
        recentDirectionalSample = null;
        scrollVelocity = 0;
        directionReversed = false;
        boundedRecovery = false;
        invalidateNativeSettled();
        cancelStableRealization();
        cancelPaintTicket('motion_reset');
    };

    const requestHardRender = (
        requiredIndexes: number[],
        reason: 'prepared_runway' | 'required_pin' | 'visible_miss',
        targetIndexes: number[],
    ) => {
        if (hardTargetIndexes && arraysEqual(hardTargetIndexes, targetIndexes)) {
            return;
        }
        hardTargetIndexes = [...targetIndexes];
        hardGeneration += 1;
        trace({event: 'hard_flush', reason, requiredIndexes});
    };

    const hasFreshDirectionalSample = (direction: Exclude<AdaptiveScrollDirection, null>) => {
        const offset = virtualizer?.scrollOffset ?? null;
        const timestamp = scheduler.now();
        return Boolean(
            offset !== null &&
                recentDirectionalSample?.direction === direction &&
                Object.is(recentDirectionalSample.offset, offset) &&
                timestamp >= recentDirectionalSample.timestamp &&
                timestamp - recentDirectionalSample.timestamp <= MAX_SCROLL_SAMPLE_INTERVAL_MS,
        );
    };

    const stopMotion = (offset: number | null, timestamp: number) => {
        if (lastMotionDirection) {
            lastActiveDirection = lastMotionDirection;
            trace({event: 'motion_stop'});
        }
        scrollVelocity = 0;
        lastScrollOffset = offset;
        lastScrollTimestamp = timestamp;
        lastMotionDirection = null;
        lastActualMotionOffset = offset;
        lastActualMotionTimestamp = timestamp;
        lastActualMotionDirection = null;
        recentDirectionalSample = null;
    };

    const recordDirectionReversal = (direction: Exclude<AdaptiveScrollDirection, null>) => {
        if (!lastMotionDirection || lastMotionDirection === direction) {
            return;
        }
        const previousDirection = lastMotionDirection;
        directionReversed = true;
        boundedRecovery ||= deferred.size > 0;
        paintedDeferred.clear();
        cancelPaintTicket('direction_reversed');
        invalidateNativeSettled();
        trace({
            event: 'direction_reversed',
            from: previousDirection,
            to: direction,
        });
    };

    const updateScrollVelocity = (
        direction: Exclude<AdaptiveScrollDirection, null>,
        offset: number,
        timestamp: number,
    ) => {
        if (lastScrollOffset === null || lastScrollTimestamp === null) {
            return;
        }
        if (offset === lastScrollOffset) {
            return;
        }
        const interval = Math.max(
            8,
            Math.min(MAX_SCROLL_SAMPLE_INTERVAL_MS, timestamp - lastScrollTimestamp),
        );
        const instantaneous = Math.abs(offset - lastScrollOffset) / interval;
        if (lastMotionDirection === direction) {
            scrollVelocity =
                scrollVelocity * (1 - SCROLL_VELOCITY_ALPHA) +
                instantaneous * SCROLL_VELOCITY_ALPHA;
        } else {
            scrollVelocity = instantaneous;
        }
    };

    const updateDirectionalSample = (
        direction: Exclude<AdaptiveScrollDirection, null>,
        offset: number,
        timestamp: number,
    ) => {
        if (lastActualMotionOffset === null || lastActualMotionTimestamp === null) {
            lastActualMotionOffset = offset;
            lastActualMotionTimestamp = timestamp;
            lastActualMotionDirection = direction;
            recentDirectionalSample = null;
            return;
        }
        if (offset === lastActualMotionOffset) {
            return;
        }
        const interval = timestamp - lastActualMotionTimestamp;
        const delta = offset - lastActualMotionOffset;
        const followsDirection = direction === 'forward' ? delta > 0 : delta < 0;
        const isFresh =
            lastActualMotionDirection === direction &&
            interval >= 0 &&
            interval <= MAX_SCROLL_SAMPLE_INTERVAL_MS &&
            followsDirection;
        recentDirectionalSample = isFresh ? {direction, offset, timestamp} : null;
        lastActualMotionOffset = offset;
        lastActualMotionTimestamp = timestamp;
        lastActualMotionDirection = direction;
    };

    const updateMotion = () => {
        const direction = virtualizer?.isScrolling ? virtualizer.scrollDirection : null;
        const offset = virtualizer?.scrollOffset ?? null;
        const timestamp = scheduler.now();
        directionReversed = false;

        if (!direction || offset === null) {
            stopMotion(offset, timestamp);
            return;
        }

        // A native terminal token is exact for the gesture that produced it. A new
        // active direction invalidates it even before the offset has changed.
        invalidateNativeSettled();
        recordDirectionReversal(direction);
        updateScrollVelocity(direction, offset, timestamp);
        updateDirectionalSample(direction, offset, timestamp);

        if (nativeSettled && !Object.is(nativeSettled.offset, offset)) {
            invalidateNativeSettled();
        }
        lastScrollOffset = offset;
        lastScrollTimestamp = timestamp;
        lastMotionDirection = direction;
        lastActiveDirection = direction;
    };

    const createMotionPlan = (range: Range, directional: boolean): AdaptiveMotionPlan => {
        const baseOverscan = config.overscan;
        const direction = virtualizer?.isScrolling ? virtualizer.scrollDirection : null;
        const defaultPlan: AdaptiveMotionPlan = {
            afterRows: baseOverscan,
            beforeRows: baseOverscan,
            direction: null,
            endGuard: Math.min(baseOverscan, getGuard(baseOverscan)),
            forecastRows: 0,
            mountChunkSize: MIN_WARM_MOUNT_CHUNK_SIZE,
            startGuard: Math.min(baseOverscan, getGuard(baseOverscan)),
            urgentRows: 0,
            velocity: scrollVelocity,
        };
        if (!direction || baseOverscan <= 0 || !directional) {
            return defaultPlan;
        }

        const viewportSize = virtualizer?.options.horizontal
            ? (virtualizer.scrollRect?.width ?? 0)
            : (virtualizer?.scrollRect?.height ?? 0);
        const estimateIndex = Math.max(0, Math.min(config.count - 1, range.startIndex));
        const itemStride = Math.max(
            1,
            (virtualizer?.options.estimateSize(estimateIndex) ?? 1) +
                (virtualizer?.options.gap ?? 0),
        );
        const viewportRows = Math.max(1, Math.ceil(viewportSize / itemStride));
        const forecastRows = Math.min(
            MAX_DIRECTIONAL_RUNWAY_ROWS,
            Math.ceil((scrollVelocity * SCROLL_LOOKAHEAD_MS) / itemStride),
        );
        const baseGuard = getGuard(baseOverscan);
        const mountChunkSize = Math.min(
            boundedRecovery
                ? MAX_RECOVERY_WARM_MOUNT_CHUNK_SIZE
                : getScrollingMountChunk(baseOverscan),
            Math.max(1, forecastRows + URGENT_RUNWAY_SAFETY_ROWS),
        );
        const trailingRows = Math.min(
            baseOverscan,
            Math.max(baseGuard, Math.ceil(Math.min(baseOverscan, viewportRows) * 0.5)),
        );
        const maximumLeadingRows = Math.max(
            baseOverscan,
            Math.min(
                MAX_DIRECTIONAL_RUNWAY_ROWS,
                Math.max(
                    Math.ceil(viewportRows * MAX_DIRECTIONAL_RUNWAY_VIEWPORTS),
                    forecastRows + baseGuard + mountChunkSize,
                ),
                Math.max(baseOverscan, baseOverscan * 2 - trailingRows),
            ),
        );
        const leadingRows = Math.min(
            maximumLeadingRows,
            Math.max(baseOverscan, forecastRows + baseGuard + mountChunkSize),
        );
        const leadingGuard = Math.min(
            leadingRows,
            Math.max(baseGuard, forecastRows + mountChunkSize),
        );
        const trailingGuard = Math.min(trailingRows, baseGuard);

        return {
            afterRows: direction === 'forward' ? leadingRows : trailingRows,
            beforeRows: direction === 'backward' ? leadingRows : trailingRows,
            direction,
            endGuard: direction === 'forward' ? leadingGuard : trailingGuard,
            forecastRows,
            mountChunkSize,
            startGuard: direction === 'backward' ? leadingGuard : trailingGuard,
            urgentRows: Math.min(leadingRows, leadingGuard + URGENT_RUNWAY_SAFETY_ROWS),
            velocity: scrollVelocity,
        };
    };

    const getNativeSettled = () =>
        Boolean(
            nativeSettled &&
                nativeSettled.hardGeneration === hardGeneration &&
                Object.is(nativeSettled.offset, virtualizer?.scrollOffset ?? null),
        );

    const getRealizationCandidates = () => {
        if (!latestRange) {
            return [];
        }
        const direction = virtualizer?.scrollDirection ?? lastActiveDirection;
        return prioritize(
            [...paintedDeferred].flatMap(([index, identity]) =>
                sameIdentity(identity, deferred.get(index)) ? [index] : [],
            ),
            latestRange,
            direction,
        );
    };

    const realizePainted = (
        limit: number,
        reason: 'active_recovery' | 'idle_stable' | 'native_settle',
    ) => {
        const indexes = getRealizationCandidates().slice(0, limit);
        if (indexes.length === 0) {
            return [];
        }
        const next = new Map(deferred);
        for (const index of indexes) {
            next.delete(index);
            paintedDeferred.delete(index);
        }
        setDeferred(next);
        invalidatePendingProposals();
        trace({event: 'realize', indexes, reason});
        scheduleFrame();
        return indexes;
    };

    const scheduleStableRealization = () => {
        if (stableRealizationRelease || virtualizer?.isScrolling) {
            return;
        }
        stableRealizationRelease = scheduler.setTimer(() => {
            stableRealizationRelease = null;
            if (!virtualizer?.isScrolling) {
                realizePainted(MAX_STABLE_REALIZATION_CHUNK_SIZE, 'idle_stable');
            }
        }, STABLE_REALIZATION_DELAY_MS);
    };

    const finishPaintTicket = (ticket: PaintTicket) => {
        if (paintTicket !== ticket) {
            return;
        }
        paintTicket = null;
        invalidatePendingProposals();
        if (
            disposed ||
            ticket.lifecycle !== lifecycle ||
            ticket.virtualizer !== virtualizer ||
            (virtualizer.isScrolling && ticket.direction !== virtualizer.scrollDirection)
        ) {
            trace({
                event: 'paint_ticket_cancel',
                reason: 'stale_after_paint',
                ticketId: ticket.id,
            });
            return;
        }

        const promoted: number[] = [];
        for (const [index, identity] of ticket.identities) {
            if (sameIdentity(identity, deferred.get(index))) {
                paintedDeferred.set(index, identity);
                promoted.push(index);
            }
        }
        trace({
            candidateIndexes: promoted,
            event: 'paint_ticket_finish',
            ticketId: ticket.id,
        });

        if (getNativeSettled()) {
            realizePainted(MAX_NATIVE_SETTLED_REALIZATION_CHUNK_SIZE, 'native_settle');
        } else if (virtualizer.isScrolling && boundedRecovery) {
            realizePainted(MAX_REALIZATION_CHUNK_SIZE, 'active_recovery');
        } else if (!virtualizer.isScrolling) {
            scheduleStableRealization();
        }
    };

    const schedulePaintTicket = () => {
        if (!virtualizer || deferred.size === 0) {
            cancelPaintTicket('no_deferred_rows');
            return;
        }
        const identities = new Map(
            [...deferred].filter(
                ([index, identity]) =>
                    committed?.indexSet.has(index) &&
                    !sameIdentity(identity, paintedDeferred.get(index)),
            ),
        );
        if (identities.size === 0) {
            if (getNativeSettled()) {
                realizePainted(MAX_NATIVE_SETTLED_REALIZATION_CHUNK_SIZE, 'native_settle');
            } else if (virtualizer.isScrolling && boundedRecovery) {
                realizePainted(MAX_REALIZATION_CHUNK_SIZE, 'active_recovery');
            } else if (!virtualizer.isScrolling) {
                scheduleStableRealization();
            }
            return;
        }

        cancelPaintTicket('superseded');
        const ticket: PaintTicket = {
            cancel: null,
            direction: virtualizer.scrollDirection ?? lastActiveDirection,
            id: ++ticketSequence,
            identities,
            lifecycle,
            virtualizer,
        };
        paintTicket = ticket;
        ticket.cancel = scheduler.requestAfterPaint(() => finishPaintTicket(ticket));
        trace({
            candidateIndexes: [...identities.keys()],
            event: 'paint_ticket_schedule',
            ticketId: ticket.id,
        });
    };

    const resetRanges = () => {
        latestRange = null;
        committed = null;
        outputIndexes = [];
        hardTargetIndexes = null;
        customRangePassThrough = false;
        setDeferred(new Map());
        paintedDeferred.clear();
        cancelFrame();
        cancelIdleTrim();
        cancelStableRealization();
        cancelPaintTicket('range_reset');
    };

    const extractCustomRange = (range: Range, target: number[]) => {
        customRangePassThrough = true;
        const plan = createMotionPlan(range, false);
        const visibleTarget = target.filter(
            (index) => index >= range.startIndex && index <= range.endIndex,
        );
        outputIndexes = target;
        hardTargetIndexes = null;
        boundedRecovery = false;
        idleTrimReady = false;
        setDeferred(new Map());
        paintedDeferred.clear();
        cancelFrame();
        cancelIdleTrim();
        cancelStableRealization();
        cancelPaintTicket('custom_range');
        trace({
            criticalIndexes: visibleTarget,
            custom: true,
            event: 'range_plan',
            outputIndexes: [...outputIndexes],
            plan,
            safe: true,
            targetIndexes: target,
        });
        return outputIndexes;
    };

    const getRemainingDirectionalRunway = (
        range: Range,
        plan: AdaptiveMotionPlan,
        coverage: Pick<Range, 'startIndex' | 'endIndex'> | null,
    ) => {
        if (coverage && plan.direction === 'forward') {
            return coverage.endIndex - range.endIndex;
        }
        if (coverage && plan.direction === 'backward') {
            return range.startIndex - coverage.startIndex;
        }
        return Number.POSITIVE_INFINITY;
    };

    const shouldPrepareDirectionalCoverage = (
        range: Range,
        plan: AdaptiveMotionPlan,
        coverage: Pick<Range, 'startIndex' | 'endIndex'> | null,
    ) => {
        if (
            !committed ||
            !virtualizer?.isScrolling ||
            !plan.direction ||
            config.lanes !== 1 ||
            virtualizer.options.horizontal
        ) {
            return false;
        }
        const remainingRunway = getRemainingDirectionalRunway(range, plan, coverage);
        return (
            directionReversed ||
            (hasFreshDirectionalSample(plan.direction) && remainingRunway <= plan.urgentRows)
        );
    };

    const createAdaptiveRangeState = (
        range: Range,
        requiredPins: readonly number[],
    ): AdaptiveRangeState => {
        customRangePassThrough = false;
        const plan = createMotionPlan(range, true);
        trace({
            event: 'motion_sample',
            forecastRows: plan.forecastRows,
            reversed: directionReversed,
            velocity: scrollVelocity,
        });
        const targetWindow = getDirectionalWindow(
            range,
            plan.beforeRows,
            plan.afterRows,
            range.count,
        );
        const warmTarget = createRange(targetWindow.startIndex, targetWindow.endIndex);
        const normalizedPins = uniqueValidIndexes(requiredPins, range.count, false);
        const target = appendUniqueIndexes(warmTarget, normalizedPins);
        const reverseRunway = directionReversed ? getModerateReverseRunway(range.overscan) : 2;
        let criticalWindow = getDirectionalWindow(
            range,
            plan.direction === 'backward' ? Math.max(plan.urgentRows, 2) : reverseRunway,
            plan.direction === 'forward' ? Math.max(plan.urgentRows, 2) : reverseRunway,
            range.count,
        );
        const committedCoverage = committed
            ? getContiguousCoverageWindow(range, committed.indexSet, range.count)
            : null;
        const canPrepareDirectionalCoverage = shouldPrepareDirectionalCoverage(
            range,
            plan,
            committedCoverage,
        );
        if (canPrepareDirectionalCoverage && plan.direction) {
            const preparedReverseRunway =
                plan.urgentRows > range.overscan ? 2 : getModerateReverseRunway(range.overscan);
            criticalWindow = getDirectionalWindow(
                range,
                plan.direction === 'backward' ? plan.beforeRows : preparedReverseRunway,
                plan.direction === 'forward' ? plan.afterRows : preparedReverseRunway,
                range.count,
            );
        }
        return {
            canPrepareDirectionalCoverage,
            critical: createRange(criticalWindow.startIndex, criticalWindow.endIndex),
            plan,
            requiredPins: normalizedPins,
            target,
            visible: createRange(range.startIndex, range.endIndex),
        };
    };

    const traceAdaptiveRange = (
        state: AdaptiveRangeState,
        criticalIndexes: number[],
        safe: boolean,
    ) => {
        trace({
            criticalIndexes,
            custom: false,
            event: 'range_plan',
            outputIndexes: [...outputIndexes],
            plan: state.plan,
            safe,
            targetIndexes: state.target,
        });
    };

    const extractInitialAdaptiveRange = (range: Range, state: AdaptiveRangeState) => {
        // The first render (and the first render after a data reset) must only
        // establish real visible coverage plus a small reverse guard. Returning
        // the full warm target here recreates the large all-real mount spike the
        // adaptive path is meant to avoid.
        const initialWindow = getDirectionalWindow(range, 2, 2, range.count);
        const initialCritical = createRange(initialWindow.startIndex, initialWindow.endIndex);
        const requiredInitial = appendUniqueIndexes(initialCritical, state.requiredPins);
        outputIndexes = requiredInitial;
        setDeferred(new Map());
        requestHardRender(state.visible, 'visible_miss', outputIndexes);
        if (!coversIndexes(state.target, new Set(outputIndexes))) {
            scheduleFrame();
        }
        traceAdaptiveRange(state, requiredInitial, false);
        return outputIndexes;
    };

    const createAdaptiveRecoveryState = (
        range: Range,
        state: AdaptiveRangeState,
        snapshot: Snapshot,
    ): AdaptiveRecoveryState => {
        const coverage = getContiguousCoverageWindow(range, snapshot.indexSet, range.count);
        const output = new Set(uniqueValidIndexes(snapshot.indexes, range.count, true));
        const missingVisible = state.visible.filter((index) => !snapshot.indexSet.has(index));
        const missingCritical = state.critical.filter((index) => !output.has(index));
        const missingRealCritical = state.critical.filter(
            (index) => !snapshot.realIndexSet.has(index),
        );
        const missingRealRequiredPins = state.requiredPins.filter(
            (index) => !snapshot.realIndexSet.has(index),
        );
        const isScrolling = Boolean(virtualizer?.isScrolling);
        const usesDeferredRecovery = Boolean(
            isScrolling && config.lanes === 1 && virtualizer && !virtualizer.options.horizontal,
        );
        const recoveryActive = Boolean(
            usesDeferredRecovery &&
                (boundedRecovery ||
                    deferred.size > 0 ||
                    missingVisible.length > 0 ||
                    missingRealRequiredPins.length > 0 ||
                    state.canPrepareDirectionalCoverage),
        );
        const nextDeferred = new Map(deferred);
        const visibleSet = new Set(state.visible);
        const prioritizedRealCritical = [
            ...prioritize(
                missingRealCritical.filter((index) => visibleSet.has(index)),
                range,
                state.plan.direction,
            ),
            ...prioritize(
                missingRealCritical.filter((index) => !visibleSet.has(index)),
                range,
                state.plan.direction,
            ),
        ];
        const realCritical = new Set(
            usesDeferredRecovery
                ? prioritizedRealCritical.slice(0, MAX_REALIZATION_CHUNK_SIZE)
                : prioritizedRealCritical,
        );
        const realizedDeferredCritical = prioritizedRealCritical.filter(
            (index) => realCritical.has(index) && nextDeferred.has(index),
        );
        for (const index of realCritical) {
            output.add(index);
            nextDeferred.delete(index);
            paintedDeferred.delete(index);
        }
        for (const index of missingCritical) {
            output.add(index);
            if (usesDeferredRecovery && !realCritical.has(index)) {
                nextDeferred.set(index, {
                    rowKey: dataRows?.[index]?.id,
                    virtualKey: getKey(index),
                });
            }
        }
        for (const index of state.requiredPins) {
            output.add(index);
            nextDeferred.delete(index);
            paintedDeferred.delete(index);
        }

        let warmMissing: number[] = [];
        if (!recoveryActive && deferred.size === 0) {
            const mountLimit = isScrolling ? state.plan.mountChunkSize : MAX_WARM_MOUNT_CHUNK_SIZE;
            warmMissing = prioritize(
                state.target.filter((index) => !output.has(index)),
                range,
                state.plan.direction,
            ).slice(0, mountLimit);
        }
        for (const index of warmMissing) {
            output.add(index);
            if (usesDeferredRecovery) {
                nextDeferred.set(index, {
                    rowKey: dataRows?.[index]?.id,
                    virtualKey: getKey(index),
                });
            }
        }

        return {
            isScrolling,
            missingCritical,
            missingRealRequiredPins,
            missingVisible,
            nextDeferred,
            output,
            realizedDeferredCritical,
            recoveryActive,
            safe: isInsideSafeArea(range, coverage, state.plan, range.count),
            targetSet: new Set(state.target),
            usesDeferredRecovery,
            visibleSet,
        };
    };

    const getAdaptiveOutputLimit = (
        range: Range,
        state: AdaptiveRangeState,
        recovery: AdaptiveRecoveryState,
        requiredCount: number,
        snapshot: Snapshot,
    ) => {
        if (!recovery.recoveryActive) {
            return Math.max(requiredCount, getScrollingDomLimit(range, range.overscan));
        }
        const growthCapacity =
            state.canPrepareDirectionalCoverage && state.plan.urgentRows <= range.overscan
                ? WARM_UNMOUNT_CHUNK_SIZE
                : 0;
        return getRecoveryOutputLimit(
            range,
            range.overscan,
            snapshot.indexes.length,
            requiredCount,
            growthCapacity,
        );
    };

    const getNormalStaleRemoveLimit = (isScrolling: boolean) => {
        if (isScrolling) {
            return WARM_UNMOUNT_CHUNK_SIZE;
        }
        if (idleTrimReady) {
            return IDLE_WARM_UNMOUNT_CHUNK_SIZE;
        }
        return 0;
    };

    const trimAdaptiveOutput = (
        range: Range,
        state: AdaptiveRangeState,
        recovery: AdaptiveRecoveryState,
        snapshot: Snapshot,
    ) => {
        const requiredSet = new Set([...state.critical, ...state.requiredPins]);
        const stale = [...recovery.output]
            .filter((index) => !recovery.targetSet.has(index) && !requiredSet.has(index))
            .sort(
                (left, right) =>
                    distanceToRange(right, range) - distanceToRange(left, range) || right - left,
            );
        const outputLimit = getAdaptiveOutputLimit(
            range,
            state,
            recovery,
            requiredSet.size,
            snapshot,
        );
        const forcedExcess = Math.max(0, recovery.output.size - outputLimit);
        const staleRemoveLimit = Math.min(
            stale.length,
            Math.max(getNormalStaleRemoveLimit(recovery.isScrolling), forcedExcess),
        );
        const indexesToRemove = stale.slice(0, staleRemoveLimit);
        const forcedRetentionExcess = Math.max(
            0,
            recovery.output.size - indexesToRemove.length - outputLimit,
        );
        if (forcedRetentionExcess > 0) {
            const retainedCandidates = [...recovery.output]
                .filter((index) => !requiredSet.has(index) && !indexesToRemove.includes(index))
                .sort(
                    (left, right) =>
                        distanceToRange(right, range) - distanceToRange(left, range) ||
                        right - left,
                );
            indexesToRemove.push(...retainedCandidates.slice(0, forcedRetentionExcess));
        }
        for (const index of indexesToRemove) {
            recovery.output.delete(index);
            recovery.nextDeferred.delete(index);
            paintedDeferred.delete(index);
        }
    };

    const requestAdaptiveRecoveryRender = (
        range: Range,
        state: AdaptiveRangeState,
        recovery: AdaptiveRecoveryState,
        snapshot: Snapshot,
    ) => {
        if (recovery.realizedDeferredCritical.length > 0) {
            boundedRecovery ||= recovery.nextDeferred.size > 0;
            const includesVisible = recovery.realizedDeferredCritical.some((index) =>
                recovery.visibleSet.has(index),
            );
            requestHardRender(
                recovery.realizedDeferredCritical,
                includesVisible ? 'visible_miss' : 'prepared_runway',
                outputIndexes,
            );
            return;
        }
        if (recovery.missingVisible.length > 0) {
            boundedRecovery ||= recovery.usesDeferredRecovery && recovery.nextDeferred.size > 0;
            requestHardRender(recovery.missingVisible, 'visible_miss', outputIndexes);
            return;
        }
        if (recovery.missingRealRequiredPins.length > 0) {
            boundedRecovery ||= recovery.usesDeferredRecovery && recovery.nextDeferred.size > 0;
            requestHardRender(recovery.missingRealRequiredPins, 'required_pin', outputIndexes);
            return;
        }
        if (state.canPrepareDirectionalCoverage && recovery.missingCritical.length > 0) {
            boundedRecovery = true;
            requestHardRender(recovery.missingCritical, 'prepared_runway', outputIndexes);
            return;
        }
        if (coversRange(range, snapshot.realIndexSet) && recovery.safe && deferred.size === 0) {
            boundedRecovery = false;
        }
    };

    const scheduleAdaptiveRangeWork = (
        state: AdaptiveRangeState,
        recovery: AdaptiveRecoveryState,
    ) => {
        const needsWarmWork = !coversIndexes(state.target, recovery.output);
        const hasStaleOutput = outputIndexes.some((index) => !recovery.targetSet.has(index));
        if (needsWarmWork || (recovery.isScrolling && hasStaleOutput)) {
            scheduleFrame();
        } else if (!recovery.isScrolling && hasStaleOutput) {
            scheduleIdleTrim();
        } else {
            idleTrimReady = false;
        }
    };

    const extractAdaptiveRange = (range: Range, requiredPins: readonly number[]) => {
        const state = createAdaptiveRangeState(range, requiredPins);
        const snapshot = committed;
        if (!snapshot) {
            return extractInitialAdaptiveRange(range, state);
        }

        const recovery = createAdaptiveRecoveryState(range, state, snapshot);
        trimAdaptiveOutput(range, state, recovery, snapshot);
        const requiredPinSet = new Set(state.requiredPins);
        const adaptiveOutput = [...recovery.output]
            .filter((index) => !requiredPinSet.has(index))
            .sort((left, right) => left - right);
        outputIndexes = appendUniqueIndexes(adaptiveOutput, state.requiredPins);
        setDeferred(recovery.nextDeferred);
        boundedRecovery ||= recovery.usesDeferredRecovery && recovery.nextDeferred.size > 0;
        requestAdaptiveRecoveryRender(range, state, recovery, snapshot);
        scheduleAdaptiveRangeWork(state, recovery);
        traceAdaptiveRange(state, state.critical, recovery.safe);
        return outputIndexes;
    };

    const normalizeConfig = (nextConfig: AdaptiveVirtualizerConfig): AdaptiveVirtualizerConfig => ({
        ...nextConfig,
        count: Math.max(0, nextConfig.count),
        lanes: Math.max(1, nextConfig.lanes),
        overscan: Math.max(0, nextConfig.overscan),
    });

    const applyConfig = (nextConfig: AdaptiveVirtualizerConfig) => {
        const previousConfig = config;
        const next = normalizeConfig(nextConfig);
        const configurationChanged =
            next.adaptive !== config.adaptive ||
            next.count !== config.count ||
            next.debugTrace !== config.debugTrace ||
            next.enabled !== config.enabled ||
            next.getItemKey !== config.getItemKey ||
            next.lanes !== config.lanes ||
            next.overscan !== config.overscan ||
            next.rangeExtractor !== config.rangeExtractor;
        const rangeBehaviorChanged =
            next.adaptive !== config.adaptive ||
            next.count !== config.count ||
            next.enabled !== config.enabled ||
            next.lanes !== config.lanes ||
            next.overscan !== config.overscan ||
            next.rangeExtractor !== config.rangeExtractor;
        config = next;
        if (!rangeBehaviorChanged) {
            return configurationChanged;
        }
        outputIndexes = uniqueValidIndexes(outputIndexes, config.count, !config.rangeExtractor);
        if (previousConfig.rangeExtractor !== config.rangeExtractor) {
            hardTargetIndexes = null;
        } else if (hardTargetIndexes) {
            hardTargetIndexes = uniqueValidIndexes(hardTargetIndexes, config.count, true);
        }
        const nextDeferred = new Map(
            [...deferred].filter(([index]) => index >= 0 && index < config.count),
        );
        setDeferred(nextDeferred);
        if (!config.enabled || !config.adaptive || config.count === 0) {
            measurementRefreshPending = false;
            resetRanges();
        }
        return configurationChanged;
    };

    const extractConfiguredRange = (range: Range) => {
        latestRange = {startIndex: range.startIndex, endIndex: range.endIndex};
        if (!config.adaptive || !config.enabled || range.count === 0) {
            return config.rangeExtractor?.(range) ?? getDefaultIndexes(range);
        }

        updateMotion();
        if (virtualizer?.isScrolling) {
            cancelIdleTrim();
            cancelStableRealization();
        }
        if (!config.rangeExtractor) {
            return extractAdaptiveRange(range, pinnedIndexes);
        }

        const target = uniqueValidIndexes(config.rangeExtractor(range), range.count, false);
        return extractCustomRange(range, target);
    };

    const createProposalEffects = (): ProposalEffects => ({
        cancelFrame: false,
        cancelIdleTrim: false,
        cancelPaintTicketReason: null,
        cancelStableRealization: false,
        scheduleFrame: false,
        scheduleIdleTrim: false,
        traces: [],
    });

    const rememberProposal = (proposal: RangeProposal) => {
        proposals.set(proposal.id, proposal);
        while (proposals.size > MAX_PENDING_PROPOSALS) {
            let oldestId: number | undefined;
            for (const id of proposals.keys()) {
                if (id !== activeProposalId) {
                    oldestId = id;
                    break;
                }
            }
            if (oldestId === undefined) {
                return;
            }
            proposals.delete(oldestId);
        }
    };

    const findProposal = (indexes: readonly number[]) => {
        const candidates = [...proposals.values()].reverse();
        return (
            candidates.find(
                (proposal) =>
                    arraysEqual(proposal.indexes, indexes) &&
                    (proposal.baseRevision === revision ||
                        (proposal.id === activeProposalId &&
                            proposal.activatedRevision === revision)),
            ) ?? null
        );
    };

    const stageRangeProposal = (range: Range, nextConfig: AdaptiveVirtualizerConfig) => {
        const previousState = captureExtractionState();
        const effects = createProposalEffects();
        draftEffects = effects;
        let indexes: number[] = [];
        let nextState = previousState;
        try {
            applyConfig(nextConfig);
            indexes = [...extractConfiguredRange(range)];
            nextState = captureExtractionState();
        } finally {
            draftEffects = null;
            restoreExtractionState(previousState);
        }
        const proposal: RangeProposal = {
            activatedRevision: null,
            baseRevision: revision,
            effects,
            id: ++proposalSequence,
            indexes,
            state: nextState,
        };
        rememberProposal(proposal);
        return proposal;
    };

    const cancelProposalEffects = (effects: ProposalEffects) => {
        if (effects.cancelFrame) {
            cancelFrame();
        }
        if (effects.cancelIdleTrim) {
            cancelIdleTrim();
        }
        if (effects.cancelStableRealization) {
            cancelStableRealization();
        }
        if (effects.cancelPaintTicketReason && paintTicket) {
            const ticket = paintTicket;
            paintTicket = null;
            ticket.cancel?.();
        }
    };

    const scheduleProposalEffects = (effects: ProposalEffects) => {
        if (effects.scheduleFrame) {
            scheduleFrame();
        }
        if (effects.scheduleIdleTrim) {
            scheduleIdleTrim();
        }
    };

    const activateProposal = (proposal: RangeProposal) => {
        if (proposal.id === activeProposalId && proposal.activatedRevision === revision) {
            return true;
        }
        if (proposal.baseRevision !== revision) {
            return false;
        }
        cancelProposalEffects(proposal.effects);
        restoreExtractionState(proposal.state);
        revision += 1;
        activeProposalId = proposal.id;
        proposals.set(proposal.id, {...proposal, activatedRevision: revision});
        proposal.effects.traces.forEach(emitTrace);
        scheduleProposalEffects(proposal.effects);
        return true;
    };

    const controller: AdaptiveVirtualizerController = {
        configure(nextConfig) {
            return normalizeConfig(nextConfig);
        },

        commitConfiguration(nextConfig) {
            if (!applyConfig(nextConfig)) {
                return false;
            }
            invalidatePendingProposals();
            return true;
        },

        setVirtualizer(nextVirtualizer) {
            const changed = virtualizer !== nextVirtualizer;
            if (virtualizer && virtualizer !== nextVirtualizer) {
                lifecycle += 1;
                cancelPaintTicket('virtualizer_changed');
                resetMotion();
            }
            virtualizer = nextVirtualizer;
            if (nextVirtualizer) {
                disposed = false;
            }
            if (changed) {
                invalidatePendingProposals();
            }
        },

        setNotify(nextNotify) {
            notify = nextNotify;
        },

        prepareData(nextRows, nextGetItemKey = getKey, lanes = config.lanes) {
            return {
                getItemKey: nextGetItemKey,
                lanes: Math.max(1, lanes),
                rows: nextRows,
            };
        },

        prepareRequiredIndexes(nextIndexes, count) {
            return {indexes: uniqueValidIndexes(nextIndexes, count, false)};
        },

        commitRequiredIndexes(next) {
            if (arraysEqual(pinnedIndexes, next.indexes)) {
                return false;
            }
            pinnedIndexes = [...next.indexes];
            revision += 1;
            activeProposalId = null;
            notify?.(false);
            return true;
        },

        commitData(nextData) {
            const nextRows = nextData.rows;
            if (
                dataRows === nextRows &&
                dataGetItemKey === nextData.getItemKey &&
                dataLanes === nextData.lanes &&
                dataKeys.length === nextRows.length
            ) {
                return false;
            }
            const nextKeys = Array.from({length: nextRows.length}, (_, index) =>
                nextData.getItemKey(index),
            );
            if (!dataRows) {
                dataRows = nextRows;
                dataKeys = nextKeys;
                dataGetItemKey = nextData.getItemKey;
                dataLanes = nextData.lanes;
                return false;
            }

            const lanesChanged = dataLanes !== nextData.lanes;
            let changed =
                lanesChanged ||
                dataRows.length !== nextRows.length ||
                dataKeys.length !== nextKeys.length;
            let unsafeKeyReuse = false;
            const previousRowsByKey = new Map<VirtualItemKey, AdaptiveDataRow>();
            dataKeys.forEach((key, index) => {
                const row = dataRows?.[index];
                if (row) {
                    previousRowsByKey.set(key, row);
                }
            });
            for (let index = 0; index < nextKeys.length; index += 1) {
                const previousAtIndex = dataRows[index];
                const nextRow = nextRows[index];
                if (
                    !Object.is(dataKeys[index], nextKeys[index]) ||
                    !Object.is(previousAtIndex?.id, nextRow?.id) ||
                    !Object.is(previousAtIndex?.original, nextRow?.original)
                ) {
                    changed = true;
                }
                const previousForKey = previousRowsByKey.get(nextKeys[index]);
                if (previousForKey && !Object.is(previousForKey.id, nextRow?.id)) {
                    unsafeKeyReuse = true;
                }
            }
            dataRows = nextRows;
            dataKeys = nextKeys;
            dataGetItemKey = nextData.getItemKey;
            dataLanes = nextData.lanes;
            if (!changed) {
                return false;
            }

            measurementGeneration += 1;
            measurementResetPending ||= unsafeKeyReuse || lanesChanged || nextData.lanes > 1;
            measurementRefreshPending = true;
            resetRanges();
            resetMotion();
            revision += 1;
            activeProposalId = null;
            return true;
        },

        flushMeasurements() {
            if (!virtualizer) {
                return;
            }
            if (measurementResetPending) {
                measurementResetPending = false;
                measurementRefreshPending = false;
                invalidatePendingProposals();
                virtualizer.measure();
            } else if (measurementRefreshPending) {
                measurementRefreshPending = false;
                invalidatePendingProposals();
                notify?.(false);
            }
        },

        getMeasurementGeneration() {
            return measurementGeneration;
        },

        getRenderGeneration(plan = null) {
            return plan
                ? (proposals.get(plan.id)?.state.renderGeneration ?? renderGeneration)
                : renderGeneration;
        },

        getDebugSnapshot(plan = null) {
            const proposalState = plan ? proposals.get(plan.id)?.state : undefined;
            const snapshot = proposalState ?? captureExtractionState();
            const nativeSettledForSnapshot = Boolean(
                snapshot.nativeSettled &&
                    snapshot.nativeSettled.hardGeneration === snapshot.hardGeneration &&
                    Object.is(snapshot.nativeSettled.offset, virtualizer?.scrollOffset ?? null),
            );
            return {
                boundedRecovery: snapshot.boundedRecovery,
                deferredIndexes: [...snapshot.deferred.keys()],
                direction: virtualizer?.scrollDirection ?? snapshot.lastActiveDirection,
                hardGeneration: snapshot.hardGeneration,
                nativeSettled: nativeSettledForSnapshot,
                outputIndexes: [...snapshot.outputIndexes],
                paintedIndexes: [...snapshot.paintedDeferred.keys()],
                pendingPaintTicket: Boolean(snapshot.paintTicket),
                range: snapshot.latestRange ? {...snapshot.latestRange} : null,
                renderGeneration: snapshot.renderGeneration,
                velocity: snapshot.scrollVelocity,
            };
        },

        getRenderPlan(indexes) {
            const proposal = findProposal(indexes);
            return proposal
                ? {id: proposal.id, renderGeneration: proposal.state.renderGeneration}
                : null;
        },

        extract(range, nextConfig = config) {
            return stageRangeProposal(range, nextConfig).indexes;
        },

        prepareForChange() {
            const indexes = virtualizer?.getVirtualItems().map(({index}) => index) ?? [];
            const proposal = findProposal(indexes);
            if (proposal) {
                activateProposal(proposal);
            }
            if (customRangePassThrough) {
                flushedHardGeneration = hardGeneration;
                return;
            }
            if (!latestRange) {
                return;
            }
            const visible = createRange(latestRange.startIndex, latestRange.endIndex);
            const missing = visible.filter((index) => !committed?.indexSet.has(index));
            if (missing.length > 0) {
                boundedRecovery = true;
                requestHardRender(missing, 'visible_miss', outputIndexes);
            }
        },

        takeHardGeneration() {
            if (hardGeneration <= flushedHardGeneration) {
                return false;
            }
            flushedHardGeneration = hardGeneration;
            return true;
        },

        isRowDeferred(plan, index, virtualKey, rowKey) {
            const proposalState = plan ? proposals.get(plan.id)?.state : undefined;
            const deferredForRender = proposalState?.deferred ?? deferred;
            const passThrough = proposalState?.customRangePassThrough ?? customRangePassThrough;
            if (passThrough) {
                return false;
            }
            const identity = deferredForRender.get(index);
            return Boolean(
                identity &&
                    Object.is(identity.virtualKey, virtualKey) &&
                    Object.is(identity.rowKey, rowKey),
            );
        },

        commit(plan, rows) {
            if (!plan) {
                return false;
            }
            const proposal = proposals.get(plan.id);
            if (!proposal || !activateProposal(proposal)) {
                return false;
            }
            committed = snapshotRows(rows);
            const nextDeferred = new Map<number, DeferredIdentity>();
            for (const row of rows) {
                const identity = deferred.get(row.index);
                if (
                    row.deferred &&
                    identity &&
                    Object.is(identity.virtualKey, row.virtualKey) &&
                    Object.is(identity.rowKey, row.rowKey)
                ) {
                    nextDeferred.set(row.index, identity);
                }
            }
            setDeferred(nextDeferred);
            trace({
                deferredIndexes: [...deferred.keys()],
                event: 'commit',
                realIndexes: [...committed.realIndexSet],
            });

            if (hardTargetIndexes && coversIndexes(hardTargetIndexes, committed.indexSet)) {
                flushedHardGeneration = hardGeneration;
                hardTargetIndexes = null;
            }
            if (deferred.size > 0) {
                schedulePaintTicket();
            } else {
                cancelPaintTicket('commit_without_deferred');
                paintedDeferred.clear();
            }
            revision += 1;
            activeProposalId = null;
            return true;
        },

        markScrollStopped() {
            if (virtualizer?.isScrolling) {
                return;
            }
            scheduleStableRealization();
            scheduleIdleTrim();
        },

        markScrollSettled() {
            nativeSettled = {
                hardGeneration,
                offset: virtualizer?.scrollOffset ?? null,
            };
            invalidatePendingProposals();
            cancelStableRealization();
            const realizedIndexes = realizePainted(
                MAX_NATIVE_SETTLED_REALIZATION_CHUNK_SIZE,
                'native_settle',
            );
            trace({event: 'native_settle', realizedIndexes});
            if (deferred.size > 0 && realizedIndexes.length === 0) {
                schedulePaintTicket();
            }
        },

        dispose() {
            disposed = true;
            lifecycle += 1;
            cancelFrame();
            cancelIdleTrim();
            cancelStableRealization();
            cancelPaintTicket('dispose');
            virtualizer = null;
            notify = null;
            committed = null;
            pinnedIndexes = [];
            proposals.clear();
            activeProposalId = null;
            revision += 1;
            deferred.clear();
            paintedDeferred.clear();
            resetMotion();
        },
    };

    return controller;
};
