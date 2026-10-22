import type {ColumnDef} from '../../../../types/base';
import {HeavyVirtualizationCell} from '../cells/HeavyVirtualizationCell';
import {cnProductionVirtualizationStory} from '../stories/ProductionVirtualizationStory.classname';

export function createHeavyVirtualizationColumns<TData extends {id: string}>(count: number) {
    return Array.from({length: count}, (_value, index): ColumnDef<TData> => {
        const columnNumber = String(index + 1).padStart(2, '0');

        return {
            id: `metric-${columnNumber}`,
            header: () => (
                <div className={cnProductionVirtualizationStory('header-cell')}>
                    <span className={cnProductionVirtualizationStory('primary-value')}>
                        SLI {columnNumber}
                    </span>
                    <span className={cnProductionVirtualizationStory('secondary-value')}>
                        48-point live window
                    </span>
                </div>
            ),
            cell: ({row}) => <HeavyVirtualizationCell columnIndex={index} rowId={row.id} />,
            size: 230,
        };
    });
}
