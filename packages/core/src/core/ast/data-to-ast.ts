import { isStandardSiteAtview, isLeafletMain, isStandardSiteLeaflet, type Document } from "../defs/document";
import { AtviewProvider, LeafletProvider } from "../providers";

export const dataToAst = <T extends Document>(post: T) => {
    if (isStandardSiteAtview(post)) {
        return AtviewProvider.dataToAst(post);
    }
    if (isLeafletMain(post)) {
        return LeafletProvider.dataToAst(post);
    }
    if (isStandardSiteLeaflet(post)) {
        return LeafletProvider.dataToAst({ pages: post.content.pages });
    }
    return null;
};
