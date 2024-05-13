import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {VirtualItem} from '@tanstack/react-virtual';

import type {BaseRowProps} from '../BaseRow';
import {Row} from '../Row';
import {VirtualizationContext} from '../VirtualizationContext';
import {toDataAttributes} from '../utils/toDataAttributes';

export interface VirtualRowProps<TData> extends BaseRowProps<TData> {
    virtualRow: VirtualItem;
}

export const VirtualRow = React.forwardRef(
    <TData,>(props: VirtualRowProps<TData>, ref: React.Ref<HTMLTableRowElement>) => {
        const {getRowDataAttributes, virtualRow, style} = props;

        const {measureRow} = React.useContext(VirtualizationContext)!;

        const virtualRowStyle = React.useMemo(
            () => ({
                transform: `translateY(${virtualRow.start}px)`,
                ...style,
            }),
            [style, virtualRow.start],
        );

        const handleRowRef = useForkRef(measureRow, ref);

        const getVirtualRowDataAttributes = React.useCallback<
            NonNullable<BaseRowProps<TData>['getRowDataAttributes']>
        >(
            (row) => ({
                ...getRowDataAttributes?.(row),
                ...toDataAttributes({
                    index: virtualRow.index,
                }),
            }),
            [getRowDataAttributes, virtualRow.index],
        );

        return (
            <Row
                {...props}
                virtualRow={undefined}
                ref={handleRowRef}
                style={virtualRowStyle}
                getRowDataAttributes={getVirtualRowDataAttributes}
            />
        );
    },
) as (<TData>(
    props: VirtualRowProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

VirtualRow.displayName = 'VirtualRow';
