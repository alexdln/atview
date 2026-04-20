import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    prettier,
    {
        files: ["*.json"],
        plugins: eslintPluginPrettierRecommended.plugins,
        rules: {
            "prettier/prettier": ["error"],
            "@typescript-eslint/no-unused-expressions": 0,
        },
    },
    globalIgnores(["**/dist/**", "**/node_modules/**", "**/lexicons/**"]),
]);

export default eslintConfig;
