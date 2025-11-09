import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

// const customHooksWithDeps = [];

export default defineConfig(
    { ignores: ["dist/", "node_modules/", "auto-generated/", ".plasmo/"] },
    {
        extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
        rules: {
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-namespace": "off",

            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: true },
            ],
        },
    },
    prettierConfig, // Turns off all rules that are unnecessary or might conflict with Prettier.
);
