import {
    type Document,
    isLeafletMain,
    isStandardSiteAtview,
    isStandardSiteLeaflet,
    isStandardSitePckt,
} from "@src/core/defs/document";
import { type AstToAtviewHtmlContext } from "@src/core/ast/ast-to-atview-html";

import { LeafletProvider } from "./leaflet";
import { AtviewProvider } from "./atview";
import { PcktProvider } from "./pckt";

export * from "../data/engines";
export * from "./atview";
export * from "./leaflet";
export * from "./pckt";

export const getDocumentAtviewHtml = <T extends Document>(post: T, context: AstToAtviewHtmlContext): string => {
    if (isStandardSiteAtview(post)) {
        return AtviewProvider.dataToAtviewHtml({ textContent: post.textContent, facets: post.content.facets }, context);
    }
    if (isLeafletMain(post)) {
        return LeafletProvider.dataToAtviewHtml(post, context);
    }
    if (isStandardSiteLeaflet(post)) {
        return LeafletProvider.dataToAtviewHtml({ pages: post.content.pages }, context);
    }
    if (isStandardSitePckt(post)) {
        return PcktProvider.dataToAtviewHtml({ items: post.content.items }, context);
    }
    return "";
};
