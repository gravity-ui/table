import baseConfig from '@gravity-ui/eslint-config';
import a11yConfig from '@gravity-ui/eslint-config/a11y';
import clientConfig from '@gravity-ui/eslint-config/client';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import prettierConfig from '@gravity-ui/eslint-config/prettier';
import {defineConfig, globalIgnores} from 'eslint/config';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import globals from 'globals';

export default defineConfig([
    globalIgnores(['build/', 'storybook-static/']),
    ...baseConfig,
    ...clientConfig,
    ...prettierConfig,
    ...importOrderConfig,
    ...a11yConfig,
    {
        rules: {
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            'import/no-extraneous-dependencies': 'off',
            'jsx-a11y/no-autofocus': 'off',
            'no-param-reassign': 'warn',
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "ImportDeclaration[source.value='react'] :matches(ImportDefaultSpecifier, ImportSpecifier)",
                    message: "Please use `import * as React from 'react'` instead.",
                },
                {
                    selector: "TSTypeReference>TSQualifiedName[left.name='React'][right.name='FC']",
                    message: "Don't use React.FC",
                },
            ],
            'react/jsx-fragments': ['error', 'element'],
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
    {
        files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        extends: [testingLibraryPlugin.configs['flat/react']],
        languageOptions: {
            globals: {...globals.node, ...globals.jest},
        },
        rules: {
            'jsx-a11y/no-static-element-interactions': 'off',
        },
    },
    {
        files: ['**/__stories__/**/*.[jt]s?(x)'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['**/*.js'],
        ignores: ['src/**'],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
