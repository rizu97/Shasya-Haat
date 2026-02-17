import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default [
    // Ignored paths
    { ignores: ['dist/**', 'node_modules/**', '*.config.*'] },

    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript + React config for all .ts/.tsx files
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            // TypeScript recommended rules (manually specified for flat config)
            ...tsPlugin.configs.recommended.rules,

            // React recommended + jsx-runtime rules
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs['jsx-runtime'].rules,

            // Custom overrides
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'react/prop-types': 'off',
            'no-console': 'off',
        },
    },
];
