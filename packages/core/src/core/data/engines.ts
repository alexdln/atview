import { LeafletProvider } from "../providers/leaflet";
import { AtviewProvider } from "../providers/atview";
import { PcktProvider } from "../providers/pckt";
import { SiteStandardProvider } from "../providers/site-standard";

export const ENGINES = {
    leaflet_blocks: {
        label: "site.standard.document [Leaflet/Blocks]",
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
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
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
        provider: AtviewProvider,
    },
    pckt_blocks: {
        label: "site.standard.document [Pckt/Blocks]",
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
        provider: PcktProvider,
    },
    site_standard_plain: {
        label: "site.standard.document [Site Standard/Plain]",
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
        provider: SiteStandardProvider,
    },
} as const;
