import React from 'react';

import type {TableProps} from '../../components/Table';
import {Table} from '../../components/Table';
import {withTableReorder} from '../../hocs';
import type {SortableListDragResult} from '../SortableList';
import {WindowVirtualizationProvider} from '../WindowVirtualizationProvider';

const GridWithReordering = withTableReorder(Table);

const rowHeight = 20;
const estimateRowSize = () => rowHeight;

export const ReorderingWithVirtualizationDemo = <ItemType extends unknown>(
    props: TableProps<ItemType>,
) => {
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

    return (
        <WindowVirtualizationProvider
            estimateRowSize={estimateRowSize}
            overscanRowCount={5}
            rowsCount={data.length}
        >
            <GridWithReordering<ItemType> {...props} data={data} onReorder={handleDragEnd} />
        </WindowVirtualizationProvider>
    );
};
