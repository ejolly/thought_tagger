module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
  },
  plugins: ['svelte3'],
  rules: {
    'no-var': 1,
    'no-console': 0,
    'no-unused-vars': [1, { args: 'none' }],
    'prefer-const': 1,
    'import/prefer-default-export': 0,
    'comma-dangle': 0,
    'max-len': 0,
    'no-restricted-syntax': 0,
    'prefer-template': 1,
    quotes: 1,
    'no-trailing-spaces': 1,
    'no-alert': 0,
    'no-underscore-dangle': 0,
    'import/no-extraneous-dependencies': 0,
    'object-curly-newline': 0,
    'no-return-assign': 0,
    'no-param-reassign': 0,
    'implicit-arrow-linebreak': 0,
    'operator-linebreak': 0,
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      rules: {
        'import/no-duplicates': 0,
        'import/first': 0,
        'import/no-mutable-exports': 0,
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0,
        'import/extensions': 0,
        'no-unused-vars': 1,
      },
      processor: 'svelte3/svelte3',
    },
  ],
};
