import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import pluginSecurity from "eslint-plugin-security";

export default defineConfig([
  {
    files:
      ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node }
  },
  tseslint.configs.recommended,
  pluginSecurity.configs.recommended,

  // Specific configuration for test files
  {
    files: ['**/*.test.ts'], // Target test files
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Disable for test files
    }
  }
]);
