import React from 'react';

import {configure} from '@gravity-ui/uikit';
import type {Decorator} from '@storybook/react';

import {configure as localConfigure} from '../../src/utils';

export const withLang: Decorator = (Story, context) => {
    const lang = context.globals.lang;

    configure({lang});
    localConfigure({lang});

    return <Story key={lang} {...context} />;
};
