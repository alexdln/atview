import React, { useMemo } from "react";

import { LeafletProvider, AtviewProvider } from "@atview/core";
import { astToJsx } from "@atview/docs";

import { WysiwygData } from "../wysiwyg";

export interface EditorRendererProps {
    data: WysiwygData;
    authorDid?: string;
}

export const EditorRenderer: React.FC<EditorRendererProps> = ({ data, authorDid = "" }) => {
    const jsx = useMemo(() => {
        if (data.engine === "facets") {
            return astToJsx(AtviewProvider.dataToAst(data), { authorDid }).jsx;
        } else {
            return astToJsx(LeafletProvider.dataToAst(data), { authorDid }).jsx;
        }
    }, [data, authorDid]);

    return jsx;
};
