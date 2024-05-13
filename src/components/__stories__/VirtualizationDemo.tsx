import React from 'react';

import {withTableVirtualization} from '../../hocs';
import {Table} from '../Table';
import type {TableProps} from '../Table';

const TableWithVirtualization = withTableVirtualization(Table);

const rowHeight = 20;
const estimateRowSize = () => rowHeight;

export const VirtualizationDemo = <ItemType,>(props: TableProps<ItemType>) => {
    return (
        <TableWithVirtualization<ItemType>
            {...props}
            estimateRowSize={estimateRowSize}
            overscanRowCount={5}
            containerHeight="90vh"
        />
    );
};
