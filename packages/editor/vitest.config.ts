import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: false,
        include: ["tests/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@atview/core": path.resolve(__dirname, "../core/src/index.ts"),
            "@src": path.resolve(__dirname, "../core/src"),
        },
    },
});
