import type {ColumnDef, Row} from '@tanstack/react-table';

import type {AutoSizeContent, DOMMeasurementOptions, UseColumnsAutoSizeOptions} from '../types';

import {createDOMMeasureElementFactory} from './createDOMMeasureElement';

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
}): Record<string, number> {
    const container = measurement.containerRef?.current ?? document.body;
    const createElement = createDOMMeasureElementFactory(container.ownerDocument);
    const root = createElement('div', {
        className: `gt-table gt-styled-table ${measurement.className ?? ''}`,
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
            className: `gt-table__${kind} gt-styled-table__${kind}`,
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
        const id = column.id || ('accessorKey' in column && String(column.accessorKey)) || '';
        if (!config || !id) continue;
        try {
            const element = createElement('div', {style: {width: 'max-content'}});
            if (options.measureHeaderText !== false && column.header !== undefined) {
                const header = config.header ?? column.header;
                // Arbitrary React headers still require the existing React path.
                if (
                    typeof header !== 'string' &&
                    typeof header !== 'number' &&
                    (typeof header !== 'object' || !('text' in header))
                )
                    continue;
                element.append(
                    createCell(
                        asContent(header as string | number | AutoSizeContent),
                        'header-cell',
                    ),
                );
            }
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
                element.append(
                    createCell(
                        {
                            text: text ?? '',
                            extraWidth: resolve(config.extraWidth, value, row.original),
                            className: resolve(config.className, value, row.original),
                            style: resolve(config.style, value, row.original),
                        },
                        'cell',
                    ),
                );
            }
            for (const footer of config.footer ?? [])
                element.append(createCell(asContent(footer), 'footer-cell'));
            root.append(element);
            elements.push({id, element});
        } catch {
            // An unsupported value or broken formatter falls back for this column only.
        }
    }
    if (!elements.length) return {};
    container.append(root);
    try {
        const widths: Record<string, number> = {};
        for (const {id, element} of elements) {
            try {
                const width = element.getBoundingClientRect().width;
                if (Number.isFinite(width) && width >= 0) widths[id] = Math.ceil(width);
            } catch {
                // Keep measuring the remaining columns and fall back for this one.
            }
        }
        return widths;
    } finally {
        root.remove();
    }
}
