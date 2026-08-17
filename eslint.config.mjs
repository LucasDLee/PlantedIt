import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import perfectionist from "eslint-plugin-perfectionist";
import stylistic  from "@stylistic/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts"
  ]),
  {
    plugins: {
      "@stylistic": stylistic,
      "perfectionist": perfectionist
    },
    rules: {
      "@stylistic/comma-dangle": "error",
      "@stylistic/indent": ["error", 2],
      "@stylistic/semi": "error",
      "no-duplicate-imports": "error",
      "no-unused-vars": "warn",
      "perfectionist/sort-interfaces": ["error"],
      "sort-imports": "error",
      "sort-keys": [
        "error",
        "asc"
      ],
      "use-isnan": "error"
    }
  }
]);

export default eslintConfig;
