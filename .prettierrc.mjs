/**
 * @type {import('prettier').Options}
 */
export default {
    plugins: ["@ianvs/prettier-plugin-sort-imports"],
    printWidth: 140,
    tabWidth: 4,
    singleQuote: false,
    arrowParens: "avoid",

    importOrder: [
        "<BUILTIN_MODULES>", // Node.js built-in modules
        "<THIRD_PARTY_MODULES>", // Imports not matched by other special words or groups.
        "^[.]", // relative imports
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderTypeScriptVersion: "5.0.0",
};
