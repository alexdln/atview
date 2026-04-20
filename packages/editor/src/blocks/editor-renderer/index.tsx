import React, { useMemo } from "react";

import { LeafletProvider, AtviewProvider, PcktProvider, SiteStandardProvider, OffprintProvider } from "@atview/core";
import { astToJsx } from "@atview/docs";

import { WysiwygData } from "../wysiwyg";

export interface EditorRendererProps {
    data: WysiwygData;
    authorDid?: string;
}

export const EditorRenderer: React.FC<EditorRendererProps> = ({ data, authorDid = "" }) => {
    const jsx = useMemo(() => {
        if (data.engine === "atview_facets") {
            return astToJsx(AtviewProvider.dataToAst(data), { authorDid }).jsx;
        }
        if (data.engine === "leaflet_blocks" || data.engine === "leaflet_blocks_old") {
            return astToJsx(LeafletProvider.dataToAst(data), { authorDid }).jsx;
        }
        if (data.engine === "pckt_blocks") {
            return astToJsx(PcktProvider.dataToAst(data), { authorDid }).jsx;
        }
        if (data.engine === "offprint_blocks") {
            return astToJsx(OffprintProvider.dataToAst(data), { authorDid }).jsx;
        }
        return astToJsx(SiteStandardProvider.dataToAst(data), { authorDid }).jsx;
    }, [data, authorDid]);

    return jsx;
};
