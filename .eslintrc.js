module.exports = {
  extends: ['@vivlabs/eslint-config-viv-standard/javascript/strict'],
  overrides: [
    {
      env: {
        jest: true,
      },
      files: ['**/*.test.js'],
    },
  ],
}
