import { defineConfig, globalIgnores } from "eslint/config";

const browserGlobals = {
  AbortController: "readonly",
  clearInterval: "readonly",
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  FormData: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  queueMicrotask: "readonly",
  setInterval: "readonly",
  URL: "readonly",
  window: "readonly",
};

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]);

export default eslintConfig;
