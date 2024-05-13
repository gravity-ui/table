import React from 'react';

import {withTableWindowVirtualization} from '../../hocs';
import type {TableProps} from '../Table';
import {Table} from '../Table';

const TableWithWindowVirtualization = withTableWindowVirtualization(Table);

const rowHeight = 20;
const estimateRowSize = () => rowHeight;

export const WindowVirtualizationDemo = <ItemType,>(props: TableProps<ItemType>) => {
    return (
        <TableWithWindowVirtualization<ItemType>
            {...props}
            estimateRowSize={estimateRowSize}
            overscanRowCount={5}
        />
    );
};
