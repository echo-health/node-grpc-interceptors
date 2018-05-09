module.exports = {
  "parserOptions": {
    "ecmaVersion": 8
  },
  "env": {
    "node": true,
    "es6": true
  },
  "plugins": ["jest"],
  "extends": ["eslint:recommended", "plugin:jest/recommended"],
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "arrow-spacing": "error",
    "callback-return": ["error", ["callback", "cb"]],
    "camelcase": "error",
    "comma-dangle": ["error", "always-multiline"],
    "default-case": "error",
    "indent": ["error", 4],
    "linebreak-style": ["error", "unix"],
    "no-console": "warn",
    "no-multiple-empty-lines": "error",
    "no-return-await": "error",
    "no-template-curly-in-string": "error",
    "no-var": "error",
    "object-curly-spacing": ["error", "always"],
    "prefer-arrow-callback": "error",
    "prefer-const": ["error"],
    "prefer-template": "error",
    "quotes": ["error", "single"],
    "require-await": "error",
    "semi": ["error", "always"],
  }
}
