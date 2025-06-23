import antfu from '@antfu/eslint-config';

const project = ['./packages/**/tsconfig.json', './apps/**/tsconfig.json'];

export default antfu(
  {
    plugins: [],
    settings: {
      'import/resolver': {
        typescript: {
          project,
        },
      },
    },
    languageOptions: {},

    typescript: true,
    react: true,
    css: true,
    toml: true,

    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },
    ignores: ['taze.config.mts', 'tailwind.config.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'style/semi': ['error', 'always'],
      'style/arrow-parens': 'off',
      'style/brace-style': 'off',
      'style/operator-linebreak': 'off',

      'node/prefer-global/buffer': 'off',
      'antfu/if-newline': 'off',
      'ts/strict-boolean-expressions': 'off',
      'jsdoc/require-property-name': 'off',
      'jsdoc/require-property-description': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',
          fallbackSort: { type: 'unsorted' },
          ignoreCase: true,
          environment: 'bun',
          newlinesBetween: 'always',
          groups: [
            'builtin',
            { newlinesBetween: 'always' },
            'amythyst',
            { newlinesBetween: 'always' },
            'external',
            { newlinesBetween: 'always' },
            'internal',
            { newlinesBetween: 'always' },
            'parent',
            { newlinesBetween: 'always' },
            'sibling',
            { newlinesBetween: 'always' },
            'index',
          ],
          customGroups: [
            {
              groupName: 'amythyst',
              elementNamePattern: ['/^@amythyst\/.*/'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
);
