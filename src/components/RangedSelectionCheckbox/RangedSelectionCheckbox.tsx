import * as React from 'react';

import type {CheckboxProps} from '@gravity-ui/uikit';
import {Checkbox} from '@gravity-ui/uikit';
import type {CellContext, RowData} from '@tanstack/react-table';

import {useToggleRangeSelectionHandler} from '../../hooks/useToggleRangeSelectionHandler';

import {b} from './RangedSelectionCheckbox.classname';

export type RangedSelectionCheckboxProps<TData extends RowData, TValue> = Omit<
    CheckboxProps,
    'onChange'
> & {
    cellContext: CellContext<TData, TValue>;
};

function RangedSelectionCheckboxInner<TData, TValue>(
    {className, cellContext, ...restProps}: RangedSelectionCheckboxProps<TData, TValue>,
    ref: React.Ref<HTMLLabelElement>,
) {
    const handleToggleRangeSelection = useToggleRangeSelectionHandler(cellContext);

    return (
        <Checkbox
            ref={ref}
            className={b(null, className)}
            {...restProps}
            onChange={handleToggleRangeSelection}
        />
    );
}

export const RangedSelectionCheckbox = React.forwardRef(RangedSelectionCheckboxInner) as <
    TData extends RowData,
    TValue,
>(
    props: RangedSelectionCheckboxProps<TData, TValue> & {ref?: React.Ref<HTMLLabelElement>},
) => React.ReactElement;

(RangedSelectionCheckbox as React.FunctionComponent).displayName = 'RangedSelectionCheckbox';
