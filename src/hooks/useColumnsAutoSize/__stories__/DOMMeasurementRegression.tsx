import * as React from 'react';

import {ClipboardButton} from '@gravity-ui/uikit';
import type {ColumnDef} from '@tanstack/react-table';

import {Table} from '../../../components';
import {useTable} from '../../useTable';
import type {ColumnAutoSize} from '../types';
import {useColumnsAutoSize} from '../useColumnsAutoSize';

type Item = {value: string | number | null};
const rows: Item[] = [
    {value: 'WWWWWWWWWWWWWWWWWWWWWWWW'},
    {value: 'iiiiiiiiiiiiiiiiiiiiiiii'},
    {value: 'Кириллица и длинное значение'},
    {value: '🛠️ 😀 example'},
    {value: '  repeated   spaces  '},
    {value: 'line\nnext'},
    {value: 1234567.89},
    {value: 0},
    {value: null},
];
const font = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
} as const;
const format = (value: unknown) =>
    value === null || value === undefined
        ? '–'
        : typeof value === 'number'
          ? value.toLocaleString('en-US', {minimumFractionDigits: 2})
          : String(value);
const total = 'Total: 1,234,567.89';
const renderValue = (text: string, copy?: string) => (
    <div style={{...font, display: 'inline-flex', alignItems: 'center', gap: 4}}>
        <span style={{whiteSpace: 'nowrap'}}>{text}</span>
        {copy !== undefined && <ClipboardButton size="xs" view="flat" text={copy} />}
    </div>
);
const columns: ColumnDef<Item>[] = [
    {
        id: 'value',
        accessorKey: 'value',
        cell: ({getValue}) =>
            renderValue(
                format(getValue()),
                getValue() === null || getValue() === undefined ? undefined : String(getValue()),
            ),
        footer: () => renderValue(total, total),
        meta: {
            autoSize: {
                text: format,
                extraWidth: (value) => (value === null || value === undefined ? 0 : 24),
                style: font,
                footer: [{text: total, extraWidth: 24, style: font}],
            } satisfies ColumnAutoSize<Item>,
        } as ColumnDef<Item>['meta'],
    },
];

function Measured({hidden, scaled, empty}: {hidden: boolean; scaled: boolean; empty: boolean}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const sized = useColumnsAutoSize({
        columns,
        measurementContainerRef: containerRef,
        options: {measureOnce: true, measureHeaderText: false, minWidth: 50, maxWidth: 500},
    });
    const table = useTable({columns: sized.columnsWithAutoSizes, data: empty ? [] : rows});
    const {setTableInstance} = sized;
    React.useLayoutEffect(() => setTableInstance(table), [setTableInstance, table]);
    return (
        <React.Fragment>
            <output data-qa="auto-size-width" data-ready={!sized.isMeasuring}>
                {sized.columnWidths.value ?? ''}
            </output>
            <div
                ref={containerRef}
                style={{
                    display: hidden ? 'none' : 'block',
                    transform: scaled ? 'scale(.5)' : undefined,
                }}
            >
                <Table table={table} size="s" withHeader={false} withFooter />
            </div>
        </React.Fragment>
    );
}

export function DOMMeasurementRegression() {
    const [hidden, setHidden] = React.useState(true);
    const [scaled, setScaled] = React.useState(false);
    const [empty, setEmpty] = React.useState(false);
    const [instance, remount] = React.useReducer((n) => n + 1, 0);
    return (
        <div style={{width: 600}}>
            <button type="button" data-qa="auto-size-show" onClick={() => setHidden(false)}>
                Show
            </button>
            <button
                type="button"
                data-qa="auto-size-scale"
                onClick={() => {
                    setScaled(true);
                    remount();
                }}
            >
                Remount scaled
            </button>
            <button
                type="button"
                data-qa="auto-size-empty"
                onClick={() => {
                    setScaled(false);
                    setEmpty(true);
                    remount();
                }}
            >
                Remount empty
            </button>
            <button type="button" data-qa="auto-size-data" onClick={() => setEmpty(false)}>
                Load data
            </button>
            <Measured key={instance} hidden={hidden} scaled={scaled} empty={empty} />
        </div>
    );
}
