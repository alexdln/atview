import React, { useMemo } from "react";
import katex, { type KatexOptions } from "katex";

import "katex/dist/katex.min.css";

export interface MathBlockProps {
    content: string;
    displayMode?: boolean;
    options?: KatexOptions;
}

export const MathBlock: React.FC<MathBlockProps> = ({ content, options }) => {
    const html = useMemo(
        () =>
            katex.renderToString(content, {
                throwOnError: false,
                ...options,
            }),
        [content, options],
    );

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
