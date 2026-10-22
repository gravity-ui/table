import type {ColumnDef} from '../../../../types/base';
import {TreeNameCell} from '../cells/TreeNameCell';
import {cnProductionVirtualizationStory} from '../stories/ProductionVirtualizationStory.classname';
import {createHeavyVirtualizationColumns} from '../utils/createHeavyVirtualizationColumns';

import type {TreeItem} from './tree';

export const HEAVY_METRIC_COLUMN_COUNT = 32;

const identityColumns: ColumnDef<TreeItem>[] = [
    {
        accessorKey: 'name',
        id: 'service',
        header: () => (
            <div className={cnProductionVirtualizationStory('header-cell')}>
                <span className={cnProductionVirtualizationStory('primary-value')}>Service</span>
                <span className={cnProductionVirtualizationStory('secondary-value')}>
                    production workload
                </span>
            </div>
        ),
        cell: ({getValue, row}) => (
            <div className={cnProductionVirtualizationStory('identity-cell')}>
                <TreeNameCell row={row}>
                    <span className={cnProductionVirtualizationStory('tree-service')}>
                        <span className={cnProductionVirtualizationStory('primary-value')}>
                            {getValue<string>()}
                        </span>
                        <span className={cnProductionVirtualizationStory('secondary-value')}>
                            depth {row.depth} · team-{row.index % 12} · eu-central
                        </span>
                    </span>
                </TreeNameCell>
            </div>
        ),
        size: 320,
        withNestingStyles: true,
    },
    {
        accessorKey: 'status',
        id: 'status',
        header: () => (
            <div className={cnProductionVirtualizationStory('header-cell')}>
                <span className={cnProductionVirtualizationStory('primary-value')}>Health</span>
                <span className={cnProductionVirtualizationStory('secondary-value')}>
                    current state
                </span>
            </div>
        ),
        cell: ({getValue}) => {
            const status = getValue<TreeItem['status']>();
            let statusLabel = 'Critical';
            let statusMode = 'critical';

            if (status === 'free') {
                statusLabel = 'Healthy';
                statusMode = 'healthy';
            } else if (status === 'busy') {
                statusLabel = 'Warning';
                statusMode = 'warning';
            }

            return (
                <div className={cnProductionVirtualizationStory('identity-cell')}>
                    <span
                        className={cnProductionVirtualizationStory('status', {[statusMode]: true})}
                    >
                        {statusLabel}
                    </span>
                </div>
            );
        },
        size: 130,
    },
    {
        id: 'owner',
        header: 'Owner',
        cell: ({row}) => (
            <div className={cnProductionVirtualizationStory('identity-cell')}>
                <span className={cnProductionVirtualizationStory('primary-value')}>
                    Platform {row.index % 12}
                </span>
                <span className={cnProductionVirtualizationStory('secondary-value')}>
                    24×7 rotation
                </span>
            </div>
        ),
        size: 170,
    },
    {
        accessorKey: 'age',
        id: 'latency-budget',
        header: 'Latency budget',
        cell: ({getValue}) => (
            <div className={cnProductionVirtualizationStory('identity-cell')}>
                <span className={cnProductionVirtualizationStory('primary-value')}>
                    {getValue<number>()} ms
                </span>
                <span className={cnProductionVirtualizationStory('secondary-value')}>
                    monthly SLO
                </span>
            </div>
        ),
        size: 150,
    },
    {
        id: 'deployment',
        header: 'Deployment',
        cell: ({row}) => (
            <div className={cnProductionVirtualizationStory('identity-cell')}>
                <span className={cnProductionVirtualizationStory('primary-value')}>
                    v{2 + (row.index % 4)}.{row.index % 20}.{row.index % 9}
                </span>
                <span className={cnProductionVirtualizationStory('secondary-value')}>
                    {3 + (row.index % 55)} min ago
                </span>
            </div>
        ),
        size: 150,
    },
];

export const adaptiveVirtualizationColumns: ColumnDef<TreeItem>[] = [
    ...identityColumns,
    ...createHeavyVirtualizationColumns<TreeItem>(HEAVY_METRIC_COLUMN_COUNT),
];
