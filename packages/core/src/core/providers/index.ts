import { type Document, isLeafletMain, isStandardSiteAtview, isStandardSiteLeaflet } from "@src/core/defs/document";
import { type AstToAtviewHtmlContext } from "@src/core/ast/ast-to-atview-html";

import { ENGINES } from "../data/engines";
import { LeafletProvider } from "./leaflet";
import { AtviewProvider } from "./atview";

export * from "../data/engines";
export * from "./atview";
export * from "./leaflet";
export * from "./pckt";

export const getDocumentHtml = <T extends Document>(
    post: T,
    context: AstToAtviewHtmlContext,
): { html: string; engine: keyof typeof ENGINES } | null => {
    if (isStandardSiteAtview(post)) {
        return {
            html: AtviewProvider.dataToHtml({ textContent: post.textContent, facets: post.content.facets }, context),
            engine: "atview_facets",
        };
    }
    if (isLeafletMain(post)) {
        return { html: LeafletProvider.dataToHtml(post, context), engine: "leaflet_blocks_old" };
    }
    if (isStandardSiteLeaflet(post)) {
        return {
            html: LeafletProvider.dataToHtml({ pages: post.content.pages }, context),
            engine: "leaflet_blocks",
        };
    }
    return null;
};
