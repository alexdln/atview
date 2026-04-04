import React, { cache, use } from "react";
import { createHighlighter, type BuiltinLanguage } from "shiki";
import clsx from "clsx";

import { type CodeBlockProps } from "./types";
import { githubDynamic } from "./theme";

import "./code-block-content.scss";

const initBaseHighlighter = async () => {
    const highlighter = await createHighlighter({ langs: [], themes: [] });
    await highlighter.loadTheme(githubDynamic);
    return highlighter;
};

const highlighterPromise = initBaseHighlighter();

const getHighlighter = cache(async (language: BuiltinLanguage) => {
    const highlighter = await highlighterPromise;
    highlighter.loadTheme(githubDynamic);
    const loadedLanguages = highlighter.getLoadedLanguages();

    if (!loadedLanguages.includes(language)) {
        await highlighter.loadLanguage(language);
    }

    return highlighter;
});

export const CodeBlockContent: React.FC<CodeBlockProps> = ({
    code,
    lang = "plaintext" as BuiltinLanguage,
    className,
    inline,
}) => {
    const highlighter = use(getHighlighter(lang));

    const html = highlighter.codeToHtml(code, {
        lang,
        theme: "github-dynamic",
        structure: "inline",
    });

    if (inline) return <code className={className} dangerouslySetInnerHTML={{ __html: html }} />;

    return <pre className={clsx("atview-code-block-content", className)} dangerouslySetInnerHTML={{ __html: html }} />;
};
