import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Row as RowType} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {BaseCell} from '../BaseCell';
import type {BaseCellProps} from '../BaseCell';
import type {BaseGroupHeaderProps} from '../BaseGroupHeader';
import {BaseGroupHeader} from '../BaseGroupHeader';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends Omit<React.TdHTMLAttributes<HTMLTableRowElement>, 'className' | 'onClick'> {
    cellClassName?: BaseCellProps<TData>['className'];
    className?: string | ((row?: RowType<TData>) => string);
    getGroupTitle?: (row: RowType<TData>) => React.ReactNode;
    getIsCustomRow?: (row: RowType<TData>) => boolean;
    getIsGroupHeaderRow?: (row: RowType<TData>) => boolean;
    groupHeaderClassName?: string;
    onClick?: (row: RowType<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCustomRowContent?: (props: {
        Cell: typeof BaseCell<TData>;
        cellClassName?: BaseCellProps<TData>['className'];
        row: RowType<TData>;
    }) => React.ReactNode;
    renderGroupHeader?: (props: BaseGroupHeaderProps<TData>) => React.ReactNode;
    renderGroupHeaderRowContent?: (props: {
        Cell: typeof BaseCell<TData>;
        cellClassName?: BaseCellProps<TData>['className'];
        getGroupTitle?: (row: RowType<TData>) => React.ReactNode;
        row: RowType<TData>;
    }) => React.ReactNode;
    row: RowType<TData>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    style?: React.CSSProperties;
    virtualItem?: VirtualItem<HTMLTableRowElement>;
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((row: RowType<TData>) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: BaseCellProps<TData>['attributes'];
}

export const BaseRow = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            cellClassName,
            className: classNameProp,
            getGroupTitle,
            getIsCustomRow,
            getIsGroupHeaderRow,
            groupHeaderClassName,
            onClick,
            renderCustomRowContent,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            row,
            rowVirtualizer,
            style,
            virtualItem,
            attributes: attributesProp,
            cellAttributes,
            ...restProps
        }: BaseRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const rowRef = useForkRef(rowVirtualizer?.measureElement, ref);

        const className = React.useMemo(() => {
            return typeof classNameProp === 'function' ? classNameProp(row) : classNameProp;
        }, [classNameProp, row]);

        const handleClick = React.useCallback(
            (event: React.MouseEvent<HTMLTableRowElement>) => {
                onClick?.(row, event);
            },
            [onClick, row],
        );

        const renderRowContent = () => {
            if (getIsGroupHeaderRow?.(row)) {
                return renderGroupHeaderRowContent ? (
                    renderGroupHeaderRowContent({
                        Cell: BaseCell,
                        cellClassName,
                        getGroupTitle,
                        row,
                    })
                ) : (
                    <BaseCell
                        className={cellClassName}
                        colSpan={row.getVisibleCells().length}
                        attributes={cellAttributes}
                        aria-colindex={1}
                    >
                        {renderGroupHeader ? (
                            renderGroupHeader({
                                className: b('group-header', groupHeaderClassName),
                                getGroupTitle,
                                row,
                            })
                        ) : (
                            <BaseGroupHeader
                                className={b('group-header', groupHeaderClassName)}
                                getGroupTitle={getGroupTitle}
                                row={row}
                            />
                        )}
                    </BaseCell>
                );
            }

            if (getIsCustomRow?.(row) && renderCustomRowContent) {
                return renderCustomRowContent({Cell: BaseCell, cellClassName, row});
            }

            return row
                .getVisibleCells()
                .map((cell) => (
                    <BaseCell
                        key={cell.id}
                        cell={cell}
                        className={cellClassName}
                        attributes={cellAttributes}
                        aria-colindex={cell.column.getIndex() + 1}
                    />
                ));
        };

        const attributes =
            typeof attributesProp === 'function' ? attributesProp(row) : attributesProp;

        return (
            <tr
                ref={rowRef}
                style={{
                    top: virtualItem?.start,
                    ...style,
                }}
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
                {...restProps}
                {...attributes}
            >
                {renderRowContent()}
            </tr>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

BaseRow.displayName = 'BaseRow';
