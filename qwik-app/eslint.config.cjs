// eslint.config.cjs

const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const qwikPlugin = require("eslint-plugin-qwik");
const typescriptEslintParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: [
      "**/*.log",
      "**/.DS_Store",
      ".vscode/settings.json",
      ".history",
      ".yarn",
      "bazel-*",
      "bazel-bin",
      "bazel-out",
      "bazel-qwik",
      "bazel-testlogs",
      "dist",
      "dist-dev",
      "lib",
      "lib-types",
      "etc",
      "external",
      "node_modules",
      "temp",
      "tsc-out",
      "tsdoc-metadata.json",
      "target",
      "output",
      "rollup.config.js",
      "build",
      ".cache",
      ".vscode",
      ".rollup.cache",
      "dist",
      "tsconfig.tsbuildinfo",
      "vite.config.ts",
      "*.spec.tsx",
      "*.spec.ts",
      ".netlify",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "server",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: typescriptEslintParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      qwik: qwikPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-spread": "off",
      "no-case-declarations": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    rules: {
      // add any JavaScript specific rules here if needed
    },
  },
];
