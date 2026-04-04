import React, { lazy, Suspense } from "react";

import { type CodeBlockProps } from "./types";
import { CodeBlockContent as CodeBlockContentServer } from "./index.server";

const CodeBlockContentClient = lazy(() =>
    import("./index.client").then((module) => ({ default: module.CodeBlockContent })),
);

export const CodeBlockContent: React.FC<CodeBlockProps> = ({ code, lang, className, inline }) => {
    if ("useState" in React) {
        return (
            <Suspense fallback={<pre>{code}</pre>}>
                <CodeBlockContentClient code={code} lang={lang} className={className} inline={inline} />
            </Suspense>
        );
    }

    return <CodeBlockContentServer code={code} lang={lang} className={className} inline={inline} />;
};
