import {
    isStandardSiteAtview,
    isLeafletMain,
    isStandardSiteLeaflet,
    isStandardSiteOffprint,
    isStandardSitePckt,
    type Document,
} from "../defs/document";
import { AtviewProvider } from "../providers/atview";
import { LeafletProvider } from "../providers/leaflet";
import { OffprintProvider } from "../providers/offprint";
import { PcktProvider } from "../providers/pckt";
import { SiteStandardProvider } from "../providers/site-standard";

export const dataToAst = <T extends Document>(post: T) => {
    if (isStandardSiteAtview(post)) {
        return AtviewProvider.dataToAst({ textContent: post.textContent, facets: post.content.facets });
    }
    if (isLeafletMain(post)) {
        return LeafletProvider.dataToAst(post);
    }
    if (isStandardSiteLeaflet(post)) {
        return LeafletProvider.dataToAst({ pages: post.content.pages });
    }
    if (isStandardSitePckt(post)) {
        return PcktProvider.dataToAst({ items: post.content.items });
    }
    if (isStandardSiteOffprint(post)) {
        return OffprintProvider.dataToAst({ items: post.content.items });
    }
    return SiteStandardProvider.dataToAst({ textContent: post.textContent });
};
