import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'public/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: [
            'src/**/*.ts',
        ],
        plugins: {
            import: importPlugin,
        },
        rules: {
            'import/no-duplicates': 'error',
            'prefer-const': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    }
);
