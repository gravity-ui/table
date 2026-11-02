import * as React from 'react';

import {Table} from '../../../components';
import type {ColumnDef} from '../../../types/base';
import {useRowVirtualizer} from '../../useRowVirtualizer';
import {useTable} from '../../useTable';

const columns: ColumnDef<{name: string; value: number}>[] = [
    {accessorKey: 'name', header: 'Name', width: 'max-content', minSize: 50, maxSize: 500},
    {accessorKey: 'value', header: 'Value', width: 'minmax(max-content, 1fr)', minSize: 50},
];
export function NativeColumnWidths() {
    const [long, setLong] = React.useState(false);
    const data = React.useMemo(
        () => [
            {name: long ? 'A much longer name for the autosize regression' : 'Name', value: 123},
        ],
        [long],
    );
    const table = useTable({
        columns,
        data,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });
    return (
        <div style={{width: 600}}>
            <button onClick={() => setLong(!long)}>Change content</button>
            <Table table={table} />
        </div>
    );
}

const virtualColumns: ColumnDef<Record<string, string>>[] = Array.from(
    {length: 12},
    (_, index) => ({
        id: String(index),
        accessorFn: (row) => row[String(index)],
        header: `Column ${index}`,
        width: index === 11 ? 'minmax(max-content, 1fr)' : 'max-content',
        minSize: 80,
        maxSize: index === 11 ? undefined : 500,
    }),
);
const virtualData = Array.from({length: 10000}, (_, index) =>
    Object.fromEntries(
        virtualColumns.map(({id}) => [id ?? '', `${index}: value for column ${id}`]),
    ),
);
export function VirtualizedNativeColumnWidths() {
    const [tick, setTick] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    // Fresh, equivalent column definitions model a dashboard widget's parent updates.
    const table = useTable({
        data: virtualData,
        columns: virtualColumns.map((column) => ({...column})),
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });
    const virtualizer = useRowVirtualizer({
        count: virtualData.length,
        estimateSize: () => 32,
        getScrollElement: () => containerRef.current,
        overscan: 5,
    });
    return (
        <div>
            <button onClick={() => setTick(tick + 1)}>Parent update {tick}</button>
            <div
                ref={containerRef}
                data-qa="virtual-autosize-container"
                style={{width: 600, height: 400, overflow: 'auto'}}
            >
                <Table
                    table={table}
                    rowVirtualizer={virtualizer}
                    stickyHeader
                    attributes={{style: {width: '100%'}}}
                    rowAttributes={{style: {width: '100%'}}}
                    cellAttributes={{style: {flexGrow: 1, flexShrink: 0}}}
                    headerCellAttributes={{style: {flexGrow: 1, flexShrink: 0}}}
                />
            </div>
        </div>
    );
}
