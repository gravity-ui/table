// eslint-disable-next-line import/order
import '@gravity-ui/uikit/styles/styles.scss';

import type {Preview} from '@storybook/react-webpack5';
import {MINIMAL_VIEWPORTS} from 'storybook/viewport';

import {withLang} from './decorators/withLang';
import {withMobile} from './decorators/withMobile';
import {withStrictMode} from './decorators/withStrictMode';
import {withTheme} from './decorators/withTheme';

const preview: Preview = {
    decorators: [withLang, withMobile, withTheme, withStrictMode],
    initialGlobals: {
        theme: 'light',
        lang: 'en',
        direction: 'ltr',
        platform: 'desktop',
    },
    globalTypes: {
        theme: {
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                    {value: 'light-hc', right: '☼', title: 'Light (high contrast)'},
                    {value: 'dark-hc', right: '☾', title: 'Dark (high contrast)'},
                ],
                dynamicTitle: true,
            },
        },
        lang: {
            toolbar: {
                title: 'Language',
                icon: 'globe',
                items: [
                    {value: 'en', right: '🇬🇧', title: 'En'},
                    {value: 'ru', right: '🇷🇺', title: 'Ru'},
                ],
                dynamicTitle: true,
            },
        },
        direction: {
            toolbar: {
                title: 'Direction',
                icon: 'menu',
                items: [
                    {value: 'ltr', title: 'Left to Right', icon: 'arrowrightalt'},
                    {value: 'rtl', title: 'Right to Left', icon: 'arrowleftalt'},
                ],
                dynamicTitle: true,
            },
        },
        platform: {
            toolbar: {
                title: 'Platform',
                items: [
                    {value: 'desktop', title: 'Desktop', icon: 'browser'},
                    {value: 'mobile', title: 'Mobile', icon: 'mobile'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {
        jsx: {
            showFunctions: true,
        },
        viewport: {
            options: MINIMAL_VIEWPORTS,
        },
    },
};

export default preview;
