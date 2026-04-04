import { LeafletProvider } from "../providers/leaflet";
import { AtviewProvider } from "../providers/atview";

export const ENGINES = {
    leaflet_blocks: {
        label: "site.standard.document [Leaflet/Blocks]",
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
        wysiwygEngine: "blocks",
        provider: LeafletProvider,
    },
    leaflet_blocks_old: {
        label: "pub.leaflet.document [Leaflet old/Blocks]",
        documentType: "pub.leaflet.document",
        publicationType: "pub.leaflet.publication",
        wysiwygEngine: "blocks",
        provider: LeafletProvider,
    },
    atview_facets: {
        label: "site.standard.document [Atview/Facets]",
        documentType: "site.standard.document",
        publicationType: "site.standard.publication",
        wysiwygEngine: "facets",
        provider: AtviewProvider,
    },
} as const;
