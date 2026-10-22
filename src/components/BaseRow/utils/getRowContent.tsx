import * as React from 'react';

import type {Cell, Row, Table} from '@tanstack/react-table';

import type {BaseCellProps} from '../../BaseCell/BaseCell';
import {BaseCell, MemoizedBaseCell} from '../../BaseCell/BaseCell';
import {BaseGroupHeader} from '../../BaseGroupHeader';
import {b} from '../../BaseTable/BaseTable.classname';
import type {BaseRowProps} from '../BaseRow';

const placeholderContentStyle: React.CSSProperties = {
    backgroundImage:
        'linear-gradient(90deg, var(--g-color-base-generic) 0, var(--g-color-base-generic) 144px, transparent 144px, transparent 168px)',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '168px 100%',
    borderRadius: 4,
    display: 'block',
    flex: '1 1 auto',
    height: 12,
    marginInline: 12,
    minWidth: 0,
    opacity: 'var(--g-table-virtualization-skeleton-opacity, 0)',
};

interface RowContentParams<TData> {
    canDeferOffscreenCellContent?: BaseRowProps<TData>['canDeferOffscreenCellContent'];
    cellAttributes?: BaseCellProps<TData>['attributes'];
    cellClassName?: BaseCellProps<TData>['className'];
    deferred: boolean;
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    groupHeaderClassName?: string;
    immediateCellContentColumnIds?: ReadonlySet<string> | null;
    offscreenCellContentHydrated: boolean;
    renderCustomRowContent?: BaseRowProps<TData>['renderCustomRowContent'];
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    renderGroupHeaderRowContent?: BaseRowProps<TData>['renderGroupHeaderRowContent'];
    renderVersion?: Readonly<Record<string, unknown>>;
    row: Row<TData>;
    table: Table<TData>;
    visibleCells: Cell<TData, unknown>[];
}

export function getRowContent<TData>({
    canDeferOffscreenCellContent,
    cellAttributes,
    cellClassName,
    deferred,
    getGroupTitle,
    getIsCustomRow,
    getIsGroupHeaderRow,
    groupHeaderClassName,
    immediateCellContentColumnIds,
    offscreenCellContentHydrated,
    renderCustomRowContent,
    renderGroupHeader,
    renderGroupHeaderRowContent,
    renderVersion,
    row,
    table,
    visibleCells,
}: RowContentParams<TData>) {
    if (deferred) {
        return {
            content: (
                <BaseCell
                    colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
                    style={{
                        alignItems: 'center',
                        backgroundColor: 'var(--g-color-base-background)',
                        display: 'flex',
                        width: table.getTotalSize(),
                    }}
                    data-virtualization-continuity="true"
                >
                    <span data-virtualization-skeleton="true" style={placeholderContentStyle} />
                </BaseCell>
            ),
            deferredCellContentCount: 0,
        };
    }

    if (getIsGroupHeaderRow?.(row)) {
        const content = renderGroupHeaderRowContent ? (
            renderGroupHeaderRowContent({
                row,
                Cell: BaseCell,
                cellClassName,
                getGroupTitle,
            })
        ) : (
            <BaseCell
                className={cellClassName}
                colSpan={visibleCells.length}
                attributes={cellAttributes}
                aria-colindex={1}
            >
                {renderGroupHeader ? (
                    renderGroupHeader({
                        row,
                        className: b('group-header', groupHeaderClassName),
                        getGroupTitle,
                    })
                ) : (
                    <BaseGroupHeader
                        row={row}
                        className={b('group-header', groupHeaderClassName)}
                        getGroupTitle={getGroupTitle}
                    />
                )}
            </BaseCell>
        );

        return {content, deferredCellContentCount: 0};
    }

    if (getIsCustomRow?.(row) && renderCustomRowContent) {
        return {
            content: renderCustomRowContent({row, Cell: BaseCell, cellClassName}),
            deferredCellContentCount: 0,
        };
    }

    let deferredCellContentCount = 0;
    const content = visibleCells.map((cell) => {
        const deferContent = Boolean(
            !offscreenCellContentHydrated &&
                canDeferOffscreenCellContent &&
                immediateCellContentColumnIds &&
                !cell.column.getIsPinned() &&
                !immediateCellContentColumnIds.has(cell.column.id) &&
                canDeferOffscreenCellContent(cell),
        );

        if (deferContent) {
            deferredCellContentCount += 1;
        }

        return (
            <MemoizedBaseCell
                key={cell.id}
                cell={cell}
                className={cellClassName}
                attributes={cellAttributes}
                deferContent={deferContent}
                memoizeContent={Boolean(canDeferOffscreenCellContent)}
                renderVersion={renderVersion}
                aria-colindex={cell.column.getIndex() + 1}
            />
        );
    });

    return {content, deferredCellContentCount};
}
