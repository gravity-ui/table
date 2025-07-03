import * as React from 'react';

import {MeasureWrapper} from '../MeasureWrapper';

export function renderElementForMeasure(element?: React.ReactNode) {
    return <MeasureWrapper>{element}</MeasureWrapper>;
}
