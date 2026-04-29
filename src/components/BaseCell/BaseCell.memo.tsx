import * as React from 'react';

import {arraysShallowEqual} from '../../utils';

import type {BaseCellProps} from './BaseCell';
import {BaseCell} from './BaseCell';

function areCellPropsEqual<TData>(prev: BaseCellProps<TData>, next: BaseCellProps<TData>): boolean {
    return (
        arraysShallowEqual(prev._rowVersion ?? [], next._rowVersion ?? []) &&
        prev.cell === next.cell &&
        prev.className === next.className &&
        prev.attributes === next.attributes &&
        prev.style === next.style &&
        prev.children === next.children &&
        prev.colSpan === next.colSpan &&
        prev['aria-colindex'] === next['aria-colindex']
    );
}

export const MemoBaseCell = React.memo(BaseCell, areCellPropsEqual) as typeof BaseCell;
