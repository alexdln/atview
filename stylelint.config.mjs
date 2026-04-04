const stylelintConfig = {
    extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
    plugins: ["stylelint-prettier"],
    rules: {
        "prettier/prettier": true,
        "selector-class-pattern": null,
    },
    ignoreFiles: [
        "**/dist/**",
        "**/node_modules/**",
        "**/*.png",
        "**/*.jpg",
        "**/*.jpeg",
        "**/*.gif",
        "**/*.svg",
        "**/*.webp",
        "**/*.ico",
    ],
};

export default stylelintConfig;
