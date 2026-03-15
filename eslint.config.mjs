import { defineConfig, globalIgnores } from "eslint/config";
// import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
    // ...nextVitals,
    ...nextTs,
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
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
]);

export default eslintConfig;
