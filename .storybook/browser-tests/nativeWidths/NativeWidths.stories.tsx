import * as React from 'react';

import {Table} from '../../../src/components';
import {useRowVirtualizer} from '../../../src/hooks/useRowVirtualizer';
import {useTable} from '../../../src/hooks/useTable';
import type {ColumnDef} from '../../../src/types/base';

const cases = [
    'Hello            world',
    'Long first line of text\nLong second line of text',
    'Кириллица и длинное значение',
    '🛠️ 😀 🛠️ 😀 🛠️ 😀 🛠️ 😀',
    '0',
];
const columns: ColumnDef<{value: string}>[] = [
    {
        accessorKey: 'value',
        width: 'max-content',
        cell: ({getValue}) => (
            <span
                data-qa="native-text"
                style={{whiteSpace: 'pre', fontFamily: 'Arial', fontSize: 16}}
            >
                {getValue<string>()}
            </span>
        ),
    },
];
function Fixture({
    value,
    virtual = false,
    initiallyHidden = false,
}: {
    value: string;
    virtual?: boolean;
    initiallyHidden?: boolean;
}) {
    const container = React.useRef<HTMLDivElement>(null);
    const data = React.useMemo(
        () => Array.from({length: virtual ? 100 : 1}, () => ({value})),
        [value, virtual],
    );
    const table = useTable({
        columns,
        data,
        defaultColumn: {minSize: 100},
        enableColumnResizing: true,
    });
    const virtualizer = useRowVirtualizer({
        count: data.length,
        estimateSize: () => 32,
        getScrollElement: () => container.current,
        overscan: 2,
    });
    return (
        <div
            data-qa="native-fixture"
            ref={container}
            style={{width: 600, height: 100, overflow: 'auto'}}
        >
            <Table
                table={table}
                withHeader={false}
                attributes={{hidden: initiallyHidden}}
                rowVirtualizer={virtual ? virtualizer : undefined}
            />
        </div>
    );
}
function Regression() {
    return (
        <div>
            {cases.map((value) => (
                <Fixture key={value} value={value} />
            ))}
            <Fixture virtual value={cases[0]} />
            <Fixture initiallyHidden value="Initially hidden long text" />
        </div>
    );
}
export default {title: 'Browser tests/Native widths', tags: ['browser-regression', '!autodocs']};
export const Layout = {render: () => <Regression />};
