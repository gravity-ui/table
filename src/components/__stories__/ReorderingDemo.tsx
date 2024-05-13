import React from 'react';

import {withTableReorder} from '../../hocs';
import type {SortableListDragResult} from '../SortableList';
import {Table} from '../Table';
import type {TableProps} from '../Table';

const TableWithReordering = withTableReorder(Table);

export const ReorderingDemo = <ItemType,>(props: TableProps<ItemType>) => {
    const {getRowId} = props;

    const [data, setData] = React.useState(props.data);

    const handleDragEnd = React.useCallback(
        ({draggedItemKey, baseItemKey}: SortableListDragResult) => {
            setData((data) => {
                const dataClone = data.slice();

                const index = dataClone.findIndex((item) => getRowId(item) === draggedItemKey);
                if (index >= 0) {
                    const dragged = dataClone.splice(index, 1)[0]!;

                    const insertIndex = dataClone.findIndex(
                        (value) => getRowId(value) === baseItemKey,
                    );
                    if (insertIndex >= 0) {
                        dataClone.splice(insertIndex + 1, 0, dragged);
                    } else {
                        dataClone.unshift(dragged);
                    }
                }

                return dataClone;
            });
        },
        [getRowId],
    );

    return <TableWithReordering<ItemType> {...props} data={data} onReorder={handleDragEnd} />;
};
