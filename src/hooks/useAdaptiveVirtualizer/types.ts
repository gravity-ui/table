import type {Range, Rect, VirtualItem, Virtualizer} from '@tanstack/react-virtual';

export type VirtualItemKey = VirtualItem['key'];

export type DirectDomUpdatesMode = 'position' | 'transform';

export type VirtualizationCoverage = 'complete' | 'none' | 'partial';

export interface RenderedRowRecord {
    deferred: boolean;
    index: number;
    rowKey: unknown;
    virtualKey: VirtualItemKey;
}

export interface RowVirtualizerRuntime {
    bodyElement: HTMLTableSectionElement | null;
    controller: AdaptiveVirtualizerController | null;
    directDomUpdates: boolean;
    directDomUpdatesAppliedMode: DirectDomUpdatesMode | null;
    directDomUpdatesMode: DirectDomUpdatesMode;
    placeholderElements: Map<VirtualItemKey, HTMLTableRowElement>;
    renderedRows: RenderedRowRecord[] | null;
}

export interface UseAdaptiveVirtualizerProps<TScrollElement extends Element | Window> {
    adaptiveFlushSync?: boolean;
    count: number;
    directDomUpdates?: boolean;
    directDomUpdatesMode?: DirectDomUpdatesMode;
    enabled?: boolean;
    getItemKey?: (index: number) => VirtualItemKey;
    lanes?: number;
    onChange?: (instance: Virtualizer<TScrollElement, HTMLTableRowElement>, sync: boolean) => void;
    overscan?: number;
    rangeExtractor?: (range: Range) => number[];
}

export interface AdaptiveVirtualizerState<TScrollElement extends Element | Window> {
    adaptiveGetItemKey: (index: number) => VirtualItemKey;
    adaptiveRangeExtractor: (range: Range) => number[];
    configuration: AdaptiveVirtualizerConfig;
    controller: AdaptiveVirtualizerController;
    handleChange: (
        instance: Virtualizer<TScrollElement, HTMLTableRowElement>,
        sync: boolean,
    ) => void;
    notifyAdaptiveRangeChange: (sync?: boolean) => void;
    runtime: RowVirtualizerRuntime;
}

/**
 * Deliberately restricted to members documented by TanStack Virtual.
 * A structural interface lets the same controller serve element and window
 * virtualizers without exposing their framework lifecycle or cache fields.
 */
export interface PublicRowVirtualizer {
    getVirtualItems(): VirtualItem[];
    isScrolling: boolean;
    measure(): void;
    options: {
        count: number;
        estimateSize(index: number): number;
        gap: number;
        getItemKey(index: number): VirtualItemKey;
        horizontal: boolean;
        scrollMargin: number;
    };
    scrollDirection: 'backward' | 'forward' | null;
    scrollOffset: number | null;
    scrollRect: Rect | null;
}

export type AdaptiveScrollDirection = PublicRowVirtualizer['scrollDirection'];

export interface AdaptiveMotionPlan {
    afterRows: number;
    beforeRows: number;
    direction: AdaptiveScrollDirection;
    endGuard: number;
    forecastRows: number;
    mountChunkSize: number;
    startGuard: number;
    urgentRows: number;
    velocity: number;
}

interface AdaptiveTraceBase {
    direction: AdaptiveScrollDirection;
    hardGeneration: number;
    offset: number | null;
    range: {endIndex: number; startIndex: number} | null;
    renderGeneration: number;
    sequence: number;
    timestamp: number;
}

export type AdaptiveTraceEvent = AdaptiveTraceBase &
    (
        | {
              event: 'motion_sample';
              forecastRows: number;
              reversed: boolean;
              velocity: number;
          }
        | {event: 'motion_stop'}
        | {
              event: 'range_plan';
              criticalIndexes: number[];
              custom: boolean;
              outputIndexes: number[];
              plan: AdaptiveMotionPlan;
              safe: boolean;
              targetIndexes: number[];
          }
        | {
              event: 'hard_flush';
              reason: 'prepared_runway' | 'required_pin' | 'visible_miss';
              requiredIndexes: number[];
          }
        | {
              event: 'paint_ticket_schedule' | 'paint_ticket_finish';
              candidateIndexes: number[];
              ticketId: number;
          }
        | {
              event: 'paint_ticket_cancel';
              reason: string;
              ticketId: number;
          }
        | {event: 'native_settle'; realizedIndexes: number[]}
        | {
              event: 'realize';
              indexes: number[];
              reason: 'active_recovery' | 'idle_stable' | 'native_settle';
          }
        | {
              event: 'commit';
              deferredIndexes: number[];
              realIndexes: number[];
          }
        | {
              event: 'direction_reversed';
              from: Exclude<AdaptiveScrollDirection, null>;
              to: Exclude<AdaptiveScrollDirection, null>;
          }
    );

export type AdaptiveDebugTrace = (event: AdaptiveTraceEvent) => void;

export interface AdaptiveScheduler {
    now(): number;
    requestAfterPaint(callback: () => void): () => void;
    requestFrame(callback: () => void): () => void;
    setTimer(callback: () => void, delay: number): () => void;
}

export interface AdaptiveControllerEnvironment {
    scheduler?: AdaptiveScheduler;
}

export interface AdaptiveControllerDebugSnapshot {
    boundedRecovery: boolean;
    deferredIndexes: number[];
    direction: AdaptiveScrollDirection;
    hardGeneration: number;
    nativeSettled: boolean;
    outputIndexes: number[];
    paintedIndexes: number[];
    pendingPaintTicket: boolean;
    range: {endIndex: number; startIndex: number} | null;
    renderGeneration: number;
    velocity: number;
}

export interface AdaptiveVirtualizerConfig {
    adaptive: boolean;
    count: number;
    debugTrace?: AdaptiveDebugTrace;
    enabled: boolean;
    getItemKey?: (index: number) => VirtualItemKey;
    lanes: number;
    overscan: number;
    rangeExtractor?: (range: Range) => number[];
}

export interface AdaptiveDataRow {
    id: unknown;
    original?: unknown;
}

export interface AdaptivePreparedData {
    readonly getItemKey: (index: number) => VirtualItemKey;
    readonly lanes: number;
    readonly rows: readonly AdaptiveDataRow[];
}

export interface AdaptivePreparedIndexes {
    readonly indexes: readonly number[];
}

export interface AdaptiveRenderPlan {
    readonly id: number;
    readonly renderGeneration: number;
}

export interface RenderedVirtualRow {
    deferred: boolean;
    index: number;
    rowKey: unknown;
    virtualKey: VirtualItemKey;
}

export type AdaptiveNotify = (sync?: boolean) => void;

export interface AdaptiveVirtualizerController {
    commit(plan: AdaptiveRenderPlan | null, rows: readonly RenderedVirtualRow[]): boolean;
    commitConfiguration(config: AdaptiveVirtualizerConfig): boolean;
    commitData(data: AdaptivePreparedData): boolean;
    commitRequiredIndexes(indexes: AdaptivePreparedIndexes): boolean;
    configure(config: AdaptiveVirtualizerConfig): AdaptiveVirtualizerConfig;
    dispose(): void;
    extract(range: Range, config?: AdaptiveVirtualizerConfig): number[];
    flushMeasurements(): void;
    getDebugSnapshot(plan?: AdaptiveRenderPlan | null): AdaptiveControllerDebugSnapshot;
    getMeasurementGeneration(): number;
    getRenderGeneration(plan?: AdaptiveRenderPlan | null): number;
    getRenderPlan(indexes: readonly number[]): AdaptiveRenderPlan | null;
    isRowDeferred(
        plan: AdaptiveRenderPlan | null,
        index: number,
        virtualKey: VirtualItemKey,
        rowKey: unknown,
    ): boolean;
    markScrollSettled(): void;
    markScrollStopped(): void;
    prepareData(
        rows: readonly AdaptiveDataRow[],
        getItemKey?: (index: number) => VirtualItemKey,
        lanes?: number,
    ): AdaptivePreparedData;
    prepareRequiredIndexes(indexes: readonly number[], count: number): AdaptivePreparedIndexes;
    prepareForChange(): void;
    setNotify(notify: AdaptiveNotify | null): void;
    setVirtualizer(virtualizer: PublicRowVirtualizer | null): void;
    takeHardGeneration(): boolean;
}

export interface Snapshot {
    indexSet: Set<number>;
    indexes: number[];
    realIndexSet: Set<number>;
}

export interface DeferredIdentity {
    rowKey: unknown;
    virtualKey: VirtualItemKey;
}

export interface DirectionalSample {
    direction: Exclude<AdaptiveScrollDirection, null>;
    offset: number;
    timestamp: number;
}

export interface PaintTicket {
    cancel: (() => void) | null;
    direction: AdaptiveScrollDirection;
    id: number;
    identities: Map<number, DeferredIdentity>;
    lifecycle: number;
    virtualizer: PublicRowVirtualizer;
}

export interface NativeSettledToken {
    hardGeneration: number;
    offset: number | null;
}

export interface AdaptiveRangeState {
    canPrepareDirectionalCoverage: boolean;
    critical: number[];
    plan: AdaptiveMotionPlan;
    requiredPins: number[];
    target: number[];
    visible: number[];
}

export interface AdaptiveRecoveryState {
    isScrolling: boolean;
    missingCritical: number[];
    missingRealRequiredPins: number[];
    missingVisible: number[];
    nextDeferred: Map<number, DeferredIdentity>;
    output: Set<number>;
    realizedDeferredCritical: number[];
    recoveryActive: boolean;
    safe: boolean;
    targetSet: Set<number>;
    usesDeferredRecovery: boolean;
    visibleSet: Set<number>;
}

export interface ExtractionStateSnapshot {
    boundedRecovery: boolean;
    committed: Snapshot | null;
    config: AdaptiveVirtualizerConfig;
    customRangePassThrough: boolean;
    deferred: Map<number, DeferredIdentity>;
    directionReversed: boolean;
    hardGeneration: number;
    hardTargetIndexes: number[] | null;
    idleTrimReady: boolean;
    lastActiveDirection: AdaptiveScrollDirection;
    lastActualMotionDirection: AdaptiveScrollDirection;
    lastActualMotionOffset: number | null;
    lastActualMotionTimestamp: number | null;
    lastMotionDirection: AdaptiveScrollDirection;
    lastScrollOffset: number | null;
    lastScrollTimestamp: number | null;
    latestRange: Pick<Range, 'startIndex' | 'endIndex'> | null;
    measurementRefreshPending: boolean;
    nativeSettled: NativeSettledToken | null;
    outputIndexes: number[];
    paintTicket: PaintTicket | null;
    paintedDeferred: Map<number, DeferredIdentity>;
    recentDirectionalSample: DirectionalSample | null;
    renderGeneration: number;
    requiredIndexes: number[];
    scrollVelocity: number;
}

export interface ProposalEffects {
    cancelFrame: boolean;
    cancelIdleTrim: boolean;
    cancelPaintTicketReason: string | null;
    cancelStableRealization: boolean;
    scheduleFrame: boolean;
    scheduleIdleTrim: boolean;
    traces: TracePayload[];
}

export interface RangeProposal {
    activatedRevision: number | null;
    baseRevision: number;
    effects: ProposalEffects;
    id: number;
    indexes: number[];
    state: ExtractionStateSnapshot;
}

export type TracePayload<T = AdaptiveTraceEvent> = T extends AdaptiveTraceEvent
    ? Omit<
          T,
          | 'direction'
          | 'hardGeneration'
          | 'offset'
          | 'range'
          | 'renderGeneration'
          | 'sequence'
          | 'timestamp'
      >
    : never;
