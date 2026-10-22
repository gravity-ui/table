import {cnProductionVirtualizationStory} from '../stories/ProductionVirtualizationStory.classname';
import {getHeavyCellMetrics} from '../utils/getHeavyCellMetrics';

export interface HeavyVirtualizationCellProps {
    columnIndex: number;
    rowId: string;
}

export const HeavyVirtualizationCell = ({columnIndex, rowId}: HeavyVirtualizationCellProps) => {
    const metrics = getHeavyCellMetrics(rowId, columnIndex);
    const trendPositive = metrics.trend >= 0;

    return (
        <div
            className={cnProductionVirtualizationStory('metric-cell')}
            data-heavy-virtualization-cell="true"
        >
            <span className={cnProductionVirtualizationStory('metric-value')}>
                {metrics.current.toFixed(1)} ms
            </span>
            <span
                className={cnProductionVirtualizationStory('metric-badge', {
                    negative: !trendPositive,
                    positive: trendPositive,
                })}
            >
                {trendPositive ? '▲' : '▼'} {Math.abs(metrics.trend).toFixed(1)}%
            </span>
            <svg
                aria-hidden
                className={cnProductionVirtualizationStory('metric-chart')}
                preserveAspectRatio="none"
                viewBox="0 0 100 20"
            >
                <polyline
                    fill="none"
                    points={metrics.points}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <span className={cnProductionVirtualizationStory('metric-bars')} aria-hidden>
                {metrics.bars.map((height, index) => (
                    <span
                        key={index}
                        className={cnProductionVirtualizationStory('metric-bar')}
                        style={{height}}
                    />
                ))}
            </span>
            <span className={cnProductionVirtualizationStory('metric-meta')}>
                avg {metrics.average.toFixed(0)} · p95 {metrics.p95.toFixed(0)}
            </span>
        </div>
    );
};
