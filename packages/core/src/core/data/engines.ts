import * as site from "../../lexicons/site";

import { LeafletProvider } from "../providers/leaflet";
import { AtviewProvider } from "../providers/atview";
import { OffprintProvider } from "../providers/offprint";
import { PcktProvider } from "../providers/pckt";
import { SiteStandardProvider } from "../providers/site-standard";

const SITE_STANDARD_DOCUMENT = site.standard.document.$nsid;
const SITE_STANDARD_PUBLICATION = "site.standard.publication" as const;

export const ENGINES = {
    leaflet_blocks: {
        label: "site.standard.document [Leaflet/Blocks]",
        documentType: SITE_STANDARD_DOCUMENT,
        publicationType: SITE_STANDARD_PUBLICATION,
        provider: LeafletProvider,
    },
    leaflet_blocks_old: {
        label: "pub.leaflet.document [Leaflet old/Blocks]",
        documentType: "pub.leaflet.document",
        publicationType: "pub.leaflet.publication",
        provider: LeafletProvider,
    },
    atview_facets: {
        label: "site.standard.document [Atview/Facets]",
        documentType: SITE_STANDARD_DOCUMENT,
        publicationType: SITE_STANDARD_PUBLICATION,
        provider: AtviewProvider,
    },
    pckt_blocks: {
        label: "site.standard.document [Pckt/Blocks]",
        documentType: SITE_STANDARD_DOCUMENT,
        publicationType: SITE_STANDARD_PUBLICATION,
        provider: PcktProvider,
    },
    offprint_blocks: {
        label: "site.standard.document [Offprint/Blocks]",
        documentType: SITE_STANDARD_DOCUMENT,
        publicationType: SITE_STANDARD_PUBLICATION,
        provider: OffprintProvider,
    },
    site_standard_plain: {
        label: "site.standard.document [Site Standard/Plain]",
        documentType: SITE_STANDARD_DOCUMENT,
        publicationType: SITE_STANDARD_PUBLICATION,
        provider: SiteStandardProvider,
    },
} as const;
