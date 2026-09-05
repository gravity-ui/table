import type {Cell} from '@tanstack/react-table';

export type CanDeferOffscreenCellContent<TData> = (cell: Cell<TData, unknown>) => boolean;
