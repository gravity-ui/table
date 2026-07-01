import * as React from 'react';

import {b} from '../ColumnReorderingProvider.classname';

let scopeCounter = 0;

export function useScope<T extends HTMLElement = HTMLDivElement>() {
    const scopeRef = React.useRef<T>(null);

    const scopeClassNameRef = React.useRef<string>();
    if (!scopeClassNameRef.current) {
        scopeCounter += 1;
        scopeClassNameRef.current = `${b()}-${scopeCounter}`;
    }

    const scopeClassName = scopeClassNameRef.current;

    return {scopeRef, scopeClassName, wrapperClassName: b(null, scopeClassName)};
}
