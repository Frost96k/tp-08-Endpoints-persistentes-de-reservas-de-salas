const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        __dirname: "readonly",
        module: "writable",
        process: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
