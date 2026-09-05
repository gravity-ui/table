import * as React from 'react';

import type {Cell, Row, Table} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {shouldSkipVirtualizedRowRender} from '../../utils/shouldSkipVirtualizedRowRender';
import type {BaseCellProps} from '../BaseCell';
import type {BaseGroupHeaderProps} from '../BaseGroupHeader';
import {b} from '../BaseTable/BaseTable.classname';

import {useRowContent} from './hooks/useRowContent';
import {useVirtualizedRow} from './hooks/useVirtualizedRow';
import {resolveRowValue} from './utils/resolveRowValue';

export interface BaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'className' | 'onClick'> {
    /** @internal */
    canDeferOffscreenCellContent?: (cell: Cell<TData, unknown>) => boolean;
    cellClassName?: BaseCellProps<TData>['className'];
    className?: string | ((row?: Row<TData>) => string);
    /** @internal */
    deferred?: boolean;
    /** @internal */
    forceOffscreenCellContentHydration?: boolean;
    getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    getIsCustomRow?: (row: Row<TData>) => boolean;
    getIsGroupHeaderRow?: (row: Row<TData>) => boolean;
    groupHeaderClassName?: string;
    /** @internal */
    immediateCellContentColumnIds?: ReadonlySet<string> | null;
    onClick?: (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCustomRowContent?: (props: {
        row: Row<TData>;
        Cell: React.FunctionComponent<BaseCellProps<TData>>;
        cellClassName?: BaseCellProps<TData>['className'];
    }) => React.ReactNode;
    renderGroupHeader?: (props: BaseGroupHeaderProps<TData>) => React.ReactNode;
    renderGroupHeaderRowContent?: (props: {
        row: Row<TData>;
        Cell: React.FunctionComponent<BaseCellProps<TData>>;
        cellClassName?: BaseCellProps<TData>['className'];
        getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    }) => React.ReactNode;
    row: Row<TData>;
    /** @internal */
    scheduleOffscreenCellContentHydration?: (hydrate: () => void) => () => void;
    /** @internal */
    tableRenderVersion?: Readonly<Record<string, unknown>>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    style?: React.CSSProperties;
    table: Table<TData>;
    virtualItem?: VirtualItem;
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: BaseCellProps<TData>['attributes'];
}

const BaseRowComponent = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            canDeferOffscreenCellContent,
            cellClassName,
            className: classNameProp,
            deferred = false,
            forceOffscreenCellContentHydration = false,
            getGroupTitle,
            getIsCustomRow,
            getIsGroupHeaderRow,
            groupHeaderClassName,
            immediateCellContentColumnIds,
            onClick,
            renderCustomRowContent,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            row,
            scheduleOffscreenCellContentHydration,
            tableRenderVersion: renderVersion,
            rowVirtualizer,
            style,
            virtualItem,
            attributes: attributesProp,
            cellAttributes,
            table,
            ...restProps
        }: BaseRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const {rowRef, virtualRowPositionStyle} = useVirtualizedRow({
            deferred,
            forwardedRef: ref,
            row,
            rowVirtualizer,
            virtualItem,
        });
        const attributes = resolveRowValue(deferred, row, attributesProp);
        const className = resolveRowValue(deferred, row, classNameProp);

        const handleClick = React.useCallback(
            (event: React.MouseEvent<HTMLTableRowElement>) => {
                const selection = window.getSelection();
                if (selection?.toString()) {
                    return;
                }

                onClick?.(row, event);
            },
            [onClick, row],
        );

        const rowContent = useRowContent({
            canDeferOffscreenCellContent,
            cellAttributes,
            cellClassName,
            deferred,
            forceOffscreenCellContentHydration,
            getGroupTitle,
            getIsCustomRow,
            getIsGroupHeaderRow,
            groupHeaderClassName,
            immediateCellContentColumnIds,
            renderCustomRowContent,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            renderVersion,
            row,
            table,
            scheduleOffscreenCellContentHydration,
        });

        return (
            <tr
                ref={rowRef}
                className={b(
                    'row',
                    {
                        placeholder: deferred,
                        selected: !deferred && row.getIsSelected(),
                        interactive: Boolean(onClick) && !deferred,
                    },
                    className,
                )}
                onClick={deferred ? undefined : handleClick}
                {...restProps}
                {...attributes}
                aria-hidden={deferred || undefined}
                data-index={virtualItem?.index}
                data-virtualization-placeholder={deferred ? 'true' : undefined}
                data-virtualization-row-state={deferred ? 'deferred' : 'real'}
                style={{
                    pointerEvents: deferred ? 'none' : undefined,
                    ...virtualRowPositionStyle,
                    minHeight: deferred ? virtualItem?.size : undefined,
                    ...style,
                    ...attributes?.style,
                }}
            >
                {rowContent}
            </tr>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

BaseRowComponent.displayName = 'BaseRowComponent';

export const BaseRow = React.memo(
    BaseRowComponent,
    shouldSkipVirtualizedRowRender,
) as typeof BaseRowComponent & {displayName?: string};

BaseRow.displayName = 'BaseRow';
