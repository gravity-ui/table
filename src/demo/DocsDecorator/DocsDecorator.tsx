import React from 'react';

import {MobileProvider, ThemeProvider, getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/blocks';
import type {DocsContainerProps} from '@storybook/blocks';

import {themes} from '../../../.storybook/theme';
import {cn} from '../../utils';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = cn('docs-decorator');

export const DocsDecorator = ({children, context}: DocsDecoratorProps) => {
    // @ts-expect-error
    const theme = context.store.globals.globals.theme;

    return (
        <div className={b()}>
            <DocsContainer context={context} theme={themes[getThemeType(theme)]}>
                <ThemeProvider theme={theme}>
                    <MobileProvider mobile={false}>{children}</MobileProvider>
                </ThemeProvider>
            </DocsContainer>
        </div>
    );
};
