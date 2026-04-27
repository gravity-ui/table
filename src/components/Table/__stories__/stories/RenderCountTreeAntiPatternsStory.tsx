import * as React from 'react';

import type {ColumnDef, ExpandedState, Row} from '@tanstack/react-table';

import {useRenderCount, useTable} from '../../../../hooks';
import {useIsExpanded} from '../../../BaseRow/RowStateContext';
import {Table} from '../../Table';
import type {TableProps} from '../../Table';

interface Item {
    id: string;
    name: string;
    children?: Item[];
}

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

// A custom context whose value invalidates on every expand toggle. Cells that
// consume it re-render even when their row is memoized — the same anti-pattern
// QuotasTable3's CollapsibleStateContext exhibits.
interface FanoutContextShape {
    expanded: ExpandedState;
}
const FanoutContext = React.createContext<FanoutContextShape | undefined>(undefined);

const NameCell = <TData extends Item>({
    row,
    value,
    customContextFanout,
}: {
    row: Row<TData>;
    value: string;
    customContextFanout: boolean;
}) => {
    // Subscribe via library hook (memo-friendly).
    const isExpandedFromLibrary = useIsExpanded(row);

    // Subscribe via custom context (memo-defeating). Read but don't use the value,
    // to demonstrate that mere subscription causes re-renders when the value flips.
    const fanoutCtx = React.useContext(FanoutContext);
    const isExpanded = customContextFanout ? Boolean(fanoutCtx) : isExpandedFromLibrary;

    const renderCount = useRenderCount();

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

const stableRowAttributes = () => ({});

export const RenderCountTreeAntiPatternsStory = (props: Partial<TableProps<Item>>) => {
    const [experimentalMemoization, setExperimentalMemoization] = React.useState(true);
    const [unstableRowAttributes, setUnstableRowAttributes] = React.useState(false);
    const [customContextFanout, setCustomContextFanout] = React.useState(false);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const columns = React.useMemo<ColumnDef<Item>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                size: 400,
                cell: (info) => (
                    <NameCell
                        row={info.row}
                        value={info.getValue<string>()}
                        customContextFanout={customContextFanout}
                    />
                ),
            },
            {accessorKey: 'id', header: 'ID', size: 120},
        ],
        [customContextFanout],
    );

    const table = useTable({
        columns,
        data,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        state: {expanded},
    });

    // Inline `rowAttributes` is the anti-pattern; module-level is the fix.
    const inlineRowAttributes = (_row: Row<Item>) => ({});
    const rowAttributes = unstableRowAttributes ? inlineRowAttributes : stableRowAttributes;

    const fanoutValue = React.useMemo(() => ({expanded}), [expanded]);

    return (
        <FanoutContext.Provider value={fanoutValue}>
            <div>
                <div
                    style={{
                        marginBottom: 12,
                        display: 'flex',
                        gap: 16,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
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
                    <label>
                        <input
                            type="checkbox"
                            checked={unstableRowAttributes}
                            onChange={(e) => setUnstableRowAttributes(e.target.checked)}
                            style={{marginRight: 6}}
                        />
                        unstableRowAttributes (anti-pattern)
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={customContextFanout}
                            onChange={(e) => setCustomContextFanout(e.target.checked)}
                            style={{marginRight: 6}}
                        />
                        customContextFanout (anti-pattern)
                    </label>
                </div>
                <p style={{fontSize: 12, color: '#666', marginTop: 0}}>
                    Toggle a row and watch the render counters. With memoization ON and both
                    anti-patterns OFF, only the toggled row + its children should turn red. Flip
                    each anti-pattern to see how it defeats the optimization.
                </p>
                <div style={{height: '70vh', overflow: 'auto'}}>
                    <Table
                        {...props}
                        table={table}
                        experimentalMemoization={experimentalMemoization}
                        rowAttributes={rowAttributes}
                    />
                </div>
            </div>
        </FanoutContext.Provider>
    );
};
