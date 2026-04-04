import React from "react";
import { type BuiltinLanguage } from "shiki";
import clsx from "clsx";

import { CodeSection } from "../code-section";
import { CodeBlockContent } from "../code-block-content/index.isomorphic";

import "./code-block.scss";

export interface CodeBlockPreviewProps {
    text: string;
    language?: string;
    filename?: string;
    className?: string;
}

export const CodeBlock: React.FC<CodeBlockPreviewProps> = ({ text, filename, language, className }) => {
    return (
        <CodeSection code={text} className={clsx("atview-code-block", className)} filename={filename}>
            <CodeBlockContent code={text} lang={language as BuiltinLanguage} />
        </CodeSection>
    );
};
