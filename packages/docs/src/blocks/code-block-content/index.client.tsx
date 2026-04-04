"use client";

import React, { useState, useLayoutEffect } from "react";
import { type BuiltinLanguage } from "shiki";
import clsx from "clsx";

import { type CodeBlockProps } from "./types";
import { highlight } from "./shared";

import "./code-block-content.scss";

export const CodeBlockContent: React.FC<CodeBlockProps> = ({
    code,
    lang = "plaintext" as BuiltinLanguage,
    className,
    inline,
}) => {
    const [nodes, setNodes] = useState<React.ReactElement | null>(null);

    useLayoutEffect(() => {
        void highlight(code, lang).then(setNodes);
    }, [code, lang]);

    if (inline) return <code className={className}>{nodes}</code>;

    return <pre className={clsx("atview-code-block-content", className)}>{nodes}</pre>;
};
