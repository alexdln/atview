import {
    type Document,
    isLeafletMain,
    isStandardSiteAtview,
    isStandardSiteLeaflet,
    isStandardSitePckt,
} from "@src/core/defs/document";
import { type AstToAtviewHtmlContext } from "@src/core/ast/ast-to-atview-html";

import { ENGINES } from "../data/engines";
import { LeafletProvider } from "./leaflet";
import { AtviewProvider } from "./atview";
import { PcktProvider } from "./pckt";

export * from "../data/engines";
export * from "./atview";
export * from "./leaflet";
export * from "./pckt";

export const getDocumentAtviewHtml = <T extends Document>(
    post: T,
    context: AstToAtviewHtmlContext,
): { html: string; engine: keyof typeof ENGINES } | null => {
    if (isStandardSiteAtview(post)) {
        return {
            html: AtviewProvider.dataToAtviewHtml(
                { textContent: post.textContent, facets: post.content.facets },
                context,
            ),
            engine: "atview_facets",
        };
    }
    if (isLeafletMain(post)) {
        return { html: LeafletProvider.dataToAtviewHtml(post, context), engine: "leaflet_blocks_old" };
    }
    if (isStandardSiteLeaflet(post)) {
        return {
            html: LeafletProvider.dataToAtviewHtml({ pages: post.content.pages }, context),
            engine: "leaflet_blocks",
        };
    }
    if (isStandardSitePckt(post)) {
        return {
            html: PcktProvider.dataToAtviewHtml({ items: post.content.items }, context),
            engine: "pckt_blocks",
        };
    }
    return null;
};
