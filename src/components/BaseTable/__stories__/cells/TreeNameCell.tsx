import React from 'react';

import {ArrowToggle, Button} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

export interface TreeNameCellProps<TData> {
    row: Row<TData>;
    depth?: number;
    value: string;
}

export const TreeNameCell = <TData,>({row, depth = 0, value}: TreeNameCellProps<TData>) => {
    return (
        <div
            style={{
                paddingLeft: 28 * depth,
            }}
        >
            {row.getCanExpand() && (
                <Button view="flat" size="s" onClick={row.getToggleExpandedHandler()}>
                    <ArrowToggle direction={row.getIsExpanded() ? 'bottom' : 'right'} size={16} />
                </Button>
            )}
            {value}
        </div>
    );
};
