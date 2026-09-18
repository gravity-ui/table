module.exports = {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
    rootDir: '.',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {tsconfig: './tsconfig.test.json'}],
        '^.+\\.m?js$': [
            'babel-jest',
            {
                babelrc: false,
                configFile: false,
                presets: [['@babel/preset-env', {targets: {node: 'current'}, modules: 'commonjs'}]],
            },
        ],
    },
    // UIKit 8's ColorPicker dependencies include these ESM-only modules.
    transformIgnorePatterns: ['/node_modules/(?!colors-named(?:-hex)?/)'],
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/__stories__/**/*', '!**/*/*.stories.{ts,tsx}'],
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/test-utils/setup-tests.ts'],
    setupFilesAfterEnv: ['<rootDir>/test-utils/setup-tests-after.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'jest-transform-css',
    },
    testMatch: ['**/*.test.[jt]s?(x)'],
};
