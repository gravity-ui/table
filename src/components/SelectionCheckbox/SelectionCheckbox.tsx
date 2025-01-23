import * as React from 'react';

import type {CheckboxProps} from '@gravity-ui/uikit';
import {Checkbox} from '@gravity-ui/uikit';

import {b} from './SelectionCheckbox.classname';

export const SelectionCheckbox = React.forwardRef(
    ({className, ...restProps}: CheckboxProps, ref: React.Ref<HTMLLabelElement>) => {
        return <Checkbox ref={ref} className={b(null, className)} {...restProps} />;
    },
);

SelectionCheckbox.displayName = 'SelectionCheckbox';
