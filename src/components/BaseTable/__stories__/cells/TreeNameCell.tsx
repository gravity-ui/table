import {ArrowToggle, Button} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import './TreeNameCell.scss';

export interface TreeNameCellProps<TData> {
    row: Row<TData>;
    depth?: number;
    value: string;
}

export const TreeNameCell = <TData,>({row, depth = 0, value}: TreeNameCellProps<TData>) => {
    return (
        <div
            className="gt-expandable-cell"
            style={{
                '--row-depth': depth,
                display: 'inline-block',
            }}
        >
            {row.getCanExpand() && (
                <Button view="flat" size="s" onClick={row.getToggleExpandedHandler()}>
                    <Button.Icon>
                        <ArrowToggle
                            direction={row.getIsExpanded() ? 'bottom' : 'right'}
                            size={16}
                        />
                    </Button.Icon>
                </Button>
            )}
            {value}
        </div>
    );
};
