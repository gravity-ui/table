import * as React from 'react';

import type {ColumnDef, ExpandedState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {Table} from '../../Table';
import type {TableProps} from '../../Table';

interface Item {
    id: string;
    name: string;
    renderCount?: number;
    children?: Item[];
}

// Build a large tree: 50 root rows each with 20 children = 1050 rows total
function buildData(): Item[] {
    const items: Item[] = [];
    for (let i = 0; i < 50; i++) {
        const children: Item[] = [];
        for (let j = 0; j < 20; j++) {
            children.push({id: `${i}-${j}`, name: `Row ${i}.${j}`});
        }
        items.push({id: `${i}`, name: `Group ${i}`, children});
    }
    return items;
}

const data = buildData();

const NameCell = <TData extends Item>({
    row,
    value,
}: {
    row: import('@tanstack/react-table').Row<TData>;
    value: string;
}) => {
    const isExpanded = row.getIsExpanded();

    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;
    const renderCount = renderCountRef.current;

    return (
        <div
            style={{
                paddingLeft: 28 * row.depth,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}
        >
            {row.getCanExpand() && (
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0 4px',
                    }}
                    onClick={row.getToggleExpandedHandler()}
                >
                    {isExpanded ? '▼' : '▶'}
                </button>
            )}
            <span>{value}</span>
            <span
                style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: renderCount > 1 ? 'red' : 'green',
                    fontFamily: 'monospace',
                }}
            >
                renders: {renderCount}
            </span>
        </div>
    );
};

const getColumns = (memo: boolean): ColumnDef<Item>[] => [
    {
        accessorKey: 'name',
        header: `Name (${memo ? 'memo ON' : 'memo OFF'})`,
        size: 400,
        cell: (info) => <NameCell row={info.row} value={info.getValue<string>()} />,
    },
    {accessorKey: 'id', header: 'ID', size: 120},
];

export const RenderCountTreeStory = (props: Partial<TableProps<Item>>) => {
    const [experimentalMemoization, setExperimentalMemoization] = React.useState(false);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const columns = React.useMemo(
        () => getColumns(experimentalMemoization),
        [experimentalMemoization],
    );

    const table = useTable({
        columns,
        data,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        state: {expanded},
    });

    return (
        <div>
            <div style={{marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center'}}>
                <label>
                    <input
                        type="checkbox"
                        checked={experimentalMemoization}
                        onChange={(e) => {
                            setExperimentalMemoization(e.target.checked);
                            setExpanded({});
                        }}
                        style={{marginRight: 6}}
                    />
                    experimentalMemoization
                </label>
                <span style={{fontSize: 12, color: '#666'}}>
                    Toggle a row and watch the render counters — green = rendered once, red =
                    re-rendered. With memo ON, only the toggled row and its children should
                    increment.
                </span>
            </div>
            <div style={{height: '80vh', overflow: 'auto'}}>
                <Table {...props} table={table} experimentalMemoization={experimentalMemoization} />
            </div>
        </div>
    );
};
