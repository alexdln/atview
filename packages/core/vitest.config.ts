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
            "@src": path.resolve(__dirname, "./src"),
        },
    },
});
