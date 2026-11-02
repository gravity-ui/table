import type {Column} from '@tanstack/react-table';

/** Lay out a detached DOM snapshot on shared CSS grid tracks before paint.
 * Empty measuring cells read track widths, exactly as in react-data-grid.
 * @returns Measured widths, or undefined for a hidden/detached table.
 */
export function measureGridColumns<T>(
    table: HTMLTableElement,
    columns: Column<T>[],
    tracks: string[],
    viewportWidth?: number,
): Record<string, number> | undefined {
    if (!table.isConnected || !table.getClientRects().length) return undefined;
    // Never switch the live virtualized rows between flex and grid layouts:
    // doing so invalidates row measurements and can trigger resize feedback.
    const snapshot = table.cloneNode(true) as HTMLTableElement;
    snapshot.setAttribute('aria-hidden', 'true');
    snapshot.inert = true;
    snapshot.removeAttribute('id');
    for (const element of Array.from(snapshot.querySelectorAll('[id]')))
        element.removeAttribute('id');
    const write = (element: HTMLElement, style: Partial<CSSStyleDeclaration>) => {
        Object.assign(element.style, style);
    };
    const probes: HTMLElement[] = [];
    try {
        write(snapshot, {
            position: 'fixed',
            left: '0',
            top: '0',
            visibility: 'hidden',
            pointerEvents: 'none',
            contain: 'layout style',
            width: `${viewportWidth || table.parentElement?.clientWidth || table.clientWidth}px`,
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: tracks.join(' '),
            alignContent: 'start',
        });
        for (const section of [snapshot.tHead, ...Array.from(snapshot.tBodies), snapshot.tFoot]) {
            if (section) write(section, {display: 'contents'});
        }
        for (const [index, row] of Array.from(snapshot.rows).entries()) {
            write(row, {display: 'contents', position: 'static', transform: 'none'});
            let start = 1;
            for (const cell of Array.from(row.cells)) {
                const id = cell.dataset.columnId;
                const columnIndex = columns.findIndex((column) => column.id === id);
                if (columnIndex >= 0) start = columnIndex + 1;
                const column = columns[columnIndex];
                write(cell, {
                    display: 'block',
                    position: 'relative',
                    width: 'auto',
                    inlineSize: 'auto',
                    minWidth: `${column?.columnDef.minSize ?? 50}px`,
                    maxWidth:
                        column?.columnDef.maxSize === undefined
                            ? 'none'
                            : `${column.columnDef.maxSize}px`,
                    gridColumn: `${start} / span ${cell.colSpan}`,
                    gridRow: String(index + 2),
                    contain: 'none',
                });
                start += cell.colSpan;
            }
        }
        for (const [index, column] of columns.entries()) {
            const probe = table.ownerDocument.createElement('div');
            Object.assign(probe.style, {
                gridColumn: String(index + 1),
                gridRow: '1',
                visibility: 'hidden',
                contain: 'strict',
                minWidth: `${column.columnDef.minSize ?? 50}px`,
                maxWidth:
                    column.columnDef.maxSize === undefined
                        ? 'none'
                        : `${column.columnDef.maxSize}px`,
            });
            probe.dataset.measuringCellKey = column.id;
            probes.push(probe);
            snapshot.append(probe);
        }
        table.parentElement?.append(snapshot);
        const widths: Record<string, number> = {};
        for (const [index, probe] of probes.entries()) {
            const width = probe.getBoundingClientRect().width;
            if (width > 0) widths[columns[index].id] = width;
        }
        return widths;
    } finally {
        snapshot.remove();
    }
}
