import React from "react";
import clsx from "clsx";

import { CopyButton } from "@src/ui/copy-button";
import { CopyText } from "@src/ui/copy-text";

import { type CodeBlockProps } from "../code-block-content/types";

import "./code-section.scss";

export interface CodeSectionProps extends Pick<CodeBlockProps, "code"> {
    filename?: string;
    children?: React.ReactNode;
    className?: string;
}

export const CodeSection: React.FC<CodeSectionProps> = ({ filename, code, children, className }) => (
    <div className={clsx("code-section", className)}>
        {filename ? (
            <div className="code-section-header">
                <CopyText className="code-section-filename" text={filename} />
                <CopyButton raw={code} />
            </div>
        ) : (
            <CopyButton raw={code} className="code-section-copy" />
        )}
        {children}
    </div>
);
