import {
    type Document,
    isLeafletMain,
    isStandardSiteAtview,
    isStandardSiteLeaflet,
    isStandardSitePckt,
    isStandardSiteOffprint,
    AtviewProvider,
    LeafletProvider,
    PcktProvider,
    OffprintProvider,
    SiteStandardProvider,
} from "@atview/core";

import { astToAtviewHtml, type AstToAtviewHtmlContext } from "./ast-to-atview-html";

export const getDocumentAtviewHtml = <T extends Document>(post: T, context: AstToAtviewHtmlContext): string => {
    if (isStandardSiteAtview(post)) {
        return astToAtviewHtml(AtviewProvider.dataToAst(post), context);
    }
    if (isLeafletMain(post)) {
        return astToAtviewHtml(LeafletProvider.dataToAst(post), context);
    }
    if (isStandardSiteLeaflet(post)) {
        return astToAtviewHtml(LeafletProvider.dataToAst({ pages: post.content.pages }), context);
    }
    if (isStandardSitePckt(post)) {
        return astToAtviewHtml(PcktProvider.dataToAst({ items: post.content.items }), context);
    }
    if (isStandardSiteOffprint(post)) {
        return astToAtviewHtml(OffprintProvider.dataToAst({ items: post.content.items }), context);
    }
    return astToAtviewHtml(SiteStandardProvider.dataToAst(post), context);
};

export { type AstToAtviewHtmlContext } from "./ast-to-atview-html";
