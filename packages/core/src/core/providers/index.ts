import {
    type Document,
    isLeafletMain,
    isStandardSiteAtview,
    isStandardSiteLeaflet,
    isStandardSitePckt,
} from "@src/core/defs/document";

import { LeafletProvider } from "./leaflet";
import { AtviewProvider } from "./atview";
import { PcktProvider } from "./pckt";
import { SiteStandardProvider } from "./site-standard";

export * from "../data/engines";
export * from "./atview";
export * from "./leaflet";
export * from "./pckt";
export * from "./site-standard";

export const getProvider = <T extends Document>(post: T) => {
    if (isStandardSiteAtview(post)) {
        return AtviewProvider;
    }
    if (isLeafletMain(post) || isStandardSiteLeaflet(post)) {
        return LeafletProvider;
    }
    if (isStandardSitePckt(post)) {
        return PcktProvider;
    }
    return SiteStandardProvider;
};
