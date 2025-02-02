const { resolve } = require('path');
module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },

  env: {
    "es2020": true,
    browser: true,
    mocha: true,
    node: true,
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier',
  ],

  plugins: [
  ],

  globals: {
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',
    // TypeScript
    quotes: ['warn', 'single', { avoidEscape: true }],
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
