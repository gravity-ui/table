import type {ColumnDef, Row} from '@tanstack/react-table';

import {b as base} from '../../../components/BaseTable/BaseTable.classname';
import {b as styled} from '../../../components/Table/Table.classname';
import {cellDefaultWidth, headerDefaultWidth} from '../constants';
import type {AutoSizeContent, DOMMeasurementOptions, UseColumnsAutoSizeOptions} from '../types';

import {createDOMMeasureElementFactory} from './createDOMMeasureElement';
import {getColumnId} from './getColumnId';

const resolve = <TData, TResult>(
    property: TResult | ((value: unknown, row: TData) => TResult),
    value: unknown,
    row: TData,
): TResult =>
    typeof property === 'function'
        ? (property as (value: unknown, row: TData) => TResult)(value, row)
        : property;

// Insert all lightweight columns before reading widths.
export function measureDOMColumns<TData>({
    columns,
    rows,
    measurement,
    options,
}: {
    columns: ColumnDef<TData>[];
    rows: Row<TData>[];
    measurement: DOMMeasurementOptions;
    options: Pick<UseColumnsAutoSizeOptions, 'padding' | 'headerPadding' | 'measureHeaderText'>;
}): Record<string, number> | undefined {
    if (!columns.length) return {};
    const container = measurement.containerRef?.current ?? document.body;
    if (
        !container.isConnected ||
        (!container.getClientRects().length &&
            container.ownerDocument.defaultView?.getComputedStyle(container).display !== 'contents')
    )
        return undefined;
    const createElement = createDOMMeasureElementFactory(container.ownerDocument);
    const root = createElement('div', {
        className: `${base()} ${styled()} ${measurement.className ?? ''}`,
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            visibility: 'hidden',
            overflow: 'hidden',
            width: 'max-content',
            height: 0,
            pointerEvents: 'none',
            contain: 'layout style',
        },
    });
    root.setAttribute('aria-hidden', 'true');
    const createCell = (content: AutoSizeContent, kind: 'cell' | 'header-cell' | 'footer-cell') => {
        const cell = createElement('div', {
            className: `${base(kind)} ${styled(kind)}`,
            styleText: `padding-inline:${(kind === 'header-cell' ? (options.headerPadding ?? 24) : (options.padding ?? 16)) / 2}px`,
            style: content.style,
        });
        cell.append(
            createElement('span', {
                className: content.className,
                textContent: content.text,
                styleText: 'display:inline-block;white-space:nowrap',
            }),
        );
        if (content.extraWidth !== undefined) {
            cell.append(
                createElement('span', {
                    styleText: 'display:inline-block',
                    style: {width: content.extraWidth},
                }),
            );
        }
        return cell;
    };
    const asContent = (value: string | number | AutoSizeContent): AutoSizeContent =>
        typeof value === 'object' ? value : {text: value};
    const elements: Array<{id: string; element: HTMLElement}> = [];
    for (const column of columns) {
        const config = column.meta?.autoSize;
        const id = getColumnId(column);
        if (!config || !id) continue;
        try {
            const element = createElement('div', {style: {width: 'max-content'}});
            const wrap = (section: 'header' | 'body' | 'footer') => {
                const node = createElement('div', {
                    className: `${base(section)} ${styled(section)}`,
                });
                element.append(node);
                return node;
            };
            const appendRow = (
                section: HTMLElement,
                content: AutoSizeContent,
                kind: 'cell' | 'header-cell' | 'footer-cell',
            ) => {
                const rowKind =
                    kind === 'cell' ? 'row' : kind === 'header-cell' ? 'header-row' : 'footer-row';
                const row = createElement('div', {
                    className: `${base(rowKind)} ${styled(rowKind)}`,
                });
                row.append(createCell(content, kind));
                section.append(row);
            };
            let hasContent = false;
            if (options.measureHeaderText !== false && column.header !== undefined) {
                const header = config.header ?? column.header;
                // Arbitrary React headers still require the existing React path.
                if (
                    typeof header !== 'string' &&
                    typeof header !== 'number' &&
                    (typeof header !== 'object' || !('text' in header))
                )
                    continue;
                const content = asContent(header as string | number | AutoSizeContent);
                hasContent = true;
                if (!String(content.text).trim())
                    element.style.minWidth = `${headerDefaultWidth + (options.headerPadding ?? 24)}px`;
                appendRow(wrap('header'), content, 'header-cell');
            }
            const body = wrap('body');
            for (const row of rows) {
                const value = row.getValue(id);
                const text =
                    config.text === undefined ? value : resolve(config.text, value, row.original);
                if (
                    text !== null &&
                    text !== undefined &&
                    typeof text !== 'string' &&
                    typeof text !== 'number'
                ) {
                    throw new Error('A lightweight measurement requires primitive text');
                }
                hasContent ||= Boolean(String(text ?? '').trim());
                appendRow(
                    body,
                    {
                        text: text ?? '',
                        extraWidth: resolve(config.extraWidth, value, row.original),
                        className: resolve(config.className, value, row.original),
                        style: resolve(config.style, value, row.original),
                    },
                    'cell',
                );
            }
            if (config.footer?.length) {
                const footer = wrap('footer');
                for (const value of config.footer) {
                    hasContent = true;
                    appendRow(footer, asContent(value), 'footer-cell');
                }
            }
            if (!hasContent) element.style.minWidth = `${cellDefaultWidth}px`;
            root.append(element);
            elements.push({id, element});
        } catch {
            if (process.env.NODE_ENV !== 'production')
                console.warn(
                    `[table] Auto-size description for column ${id} failed; using React measurement.`,
                );
        }
    }
    if (!elements.length) return {};
    container.append(root);
    try {
        if (!root.isConnected || !root.getClientRects().length) return undefined;
        const widths: Record<string, number> = {};
        for (const {id, element} of elements) {
            try {
                const layoutWidth = element.offsetWidth;
                if (layoutWidth <= 0) return undefined;
                // Computed CSS width is fractional and independent of ancestor transforms.
                const width =
                    Number.parseFloat(
                        container.ownerDocument.defaultView?.getComputedStyle(element).width ?? '',
                    ) || layoutWidth;
                if (Number.isFinite(width) && width > 0) widths[id] = Math.ceil(width);
            } catch {
                // Keep measuring the remaining columns and fall back for this one.
            }
        }
        return widths;
    } finally {
        root.remove();
    }
}
