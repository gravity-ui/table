import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Cell, Row} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {renderDefaultGroupHeader} from '../../utils';
import {b} from '../Table/Table.classname';

export interface BaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement> {
    cellClassName?: string;
    checkIsGroupRow?: (row: Row<TData>) => boolean;
    children?: React.ReactNode;
    className?: string;
    columnsCount: number;
    getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    getRowAttributes?: (
        row: Row<TData>,
    ) => React.DataHTMLAttributes<HTMLTableRowElement> | undefined;
    onClick?: (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCell: (cell: Cell<TData, unknown>) => React.ReactNode;
    renderGroupHeader?: (
        row: Row<TData>,
        getGroupTitle?: (row: Row<TData>) => React.ReactNode,
    ) => React.ReactNode;
    row: Row<TData>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    style?: React.CSSProperties;
    virtualItem?: VirtualItem;
}

export const BaseRow = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            cellClassName,
            checkIsGroupRow,
            children,
            className,
            columnsCount,
            getGroupTitle,
            getRowAttributes,
            onClick,
            renderCell,
            renderGroupHeader = renderDefaultGroupHeader,
            row,
            rowVirtualizer,
            style,
            virtualItem,
        }: BaseRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const rowRef = useForkRef(rowVirtualizer?.measureElement, ref);

        const rowStyle = React.useMemo(() => {
            if (!virtualItem) {
                return style;
            }

            return {
                top: virtualItem.start,
                ...style,
            };
        }, [style, virtualItem]);

        const handleClick = React.useCallback(
            (event: React.MouseEvent<HTMLTableRowElement>) => {
                onClick?.(row, event);
            },
            [onClick, row],
        );

        return (
            <tr
                ref={rowRef}
                style={rowStyle}
                className={b(
                    'row',
                    {
                        selected: row.getIsSelected(),
                        interactive: Boolean(onClick),
                    },
                    className,
                )}
                onClick={handleClick}
                data-index={virtualItem?.index}
                {...getRowAttributes?.(row)}
            >
                {checkIsGroupRow?.(row) ? (
                    <React.Fragment>
                        {row.getCanSelect() && renderCell(row.getVisibleCells()[0])}
                        <td
                            colSpan={row.getCanSelect() ? columnsCount - 1 : columnsCount}
                            className={b('cell', b('group-header-cell', cellClassName))}
                        >
                            {renderGroupHeader(row, getGroupTitle)}
                        </td>
                    </React.Fragment>
                ) : (
                    row
                        .getVisibleCells()
                        .map((cell) => (
                            <React.Fragment key={cell.id}>{renderCell(cell)}</React.Fragment>
                        ))
                )}
                {children}
            </tr>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

BaseRow.displayName = 'BaseRow';
