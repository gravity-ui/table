import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    addons: [
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.s?css$/i,
                        use: ['style-loader', 'css-loader', 'sass-loader'],
                    },
                ],
            },
        },
        {
            name: '@storybook/addon-essentials',
            options: {
                backgrounds: false,
            },
        },
        './theme-addon/register.tsx',
        '@storybook/addon-webpack5-compiler-babel',
    ],
    framework: '@storybook/react-webpack5',
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
};

export default config;
