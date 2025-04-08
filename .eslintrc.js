module.exports = {
  root: true,
  env: {
    browser: true, // browser global variables.
    node: true, // Node.js global variables and Node.js scoping.
    es6: true, // enable all ECMAScript 6 features except for modules (this automatically sets the ecmaVersion parser option to 6).
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 'latest',
    sourceType: 'module', // module type for import/export
  },
  extends: [
    'eslint:recommended', // or eslint-config-airbnb
    'prettier',
  ],
  // add your custom rules here
  rules: {
    'no-undef': 'off', // disable no-undef variables
    'no-unused-vars': 'off', // disable no-unused-vars variables in file
  },
  globals: {},
  ignorePatterns: [
    'gulpfile.js',
    'node_modules/',
    'assets/js/libs/',
    'assets/js/webpack/dist',
    'assets/js/webpack/assets/single',
    'assets/js/webpack/assets/modules',
    'assets/js/scripts/main_variables.js',
    'assets/js/scripts/script.js',
    'assets/js/scripts/observerLoaders.js',
    'assets/public/dash.all.min.js',
  ],
};
