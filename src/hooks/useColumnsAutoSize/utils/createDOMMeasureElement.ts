import type * as React from 'react';

const unitlessProperties = new Set(
    (
        'animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth ' +
        'boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink ' +
        'flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn ' +
        'gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order ' +
        'orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray ' +
        'strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth'
    ).split(' '),
);

export function createDOMMeasureElementFactory(document: Document): (
    tagName: 'div' | 'span',
    properties?: {
        className?: string;
        textContent?: string | number;
        styleText?: string;
        style?: React.CSSProperties;
    },
) => HTMLElement {
    return (tagName, {className, textContent, styleText, style} = {}) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent !== undefined) element.textContent = String(textContent);
        if (styleText) element.style.cssText = styleText;
        for (const [property, value] of Object.entries(style ?? {})) {
            if (value === undefined || value === null) continue;
            const name = property.startsWith('--')
                ? property
                : property
                      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
                      .replace(/^ms-/, '-ms-');
            const unprefixed = property.replace(
                /^(Webkit|Moz|ms|O)([A-Z])/,
                (_, _prefix, letter: string) => letter.toLowerCase(),
            );
            const needsPx =
                typeof value === 'number' &&
                value !== 0 &&
                !name.startsWith('--') &&
                !unitlessProperties.has(unprefixed);
            element.style.setProperty(name, needsPx ? `${value}px` : String(value));
        }
        return element;
    };
}
