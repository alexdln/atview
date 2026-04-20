import { type l } from "@atproto/lex";

import { type Main as NetAtviewDocumentMain } from "../../../lexicons/net/atview/document";
import { type Main as SiteStandardDocumentMain } from "../../../lexicons/site/standard/document";
import { type AtviewFacet } from "./atview";
import { type LeafletLinearDocument } from "./leaflet";
import { type OffprintBlock } from "./offprint";
import { type PcktBlock } from "./pckt";
import { type Blob } from "./shared";

export type StandardDocument = Omit<SiteStandardDocumentMain, "coverImage" | "bskyPostRef"> & {
    coverImage?: Blob | string;
    bskyPostRef?: { uri: string; cid?: string };
};

export type LeafletContent = { $type: "pub.leaflet.content"; pages: LeafletLinearDocument[] };
export type PcktContent = { $type: "blog.pckt.content"; items: PcktBlock[] };
export type OffprintContent = { $type: "app.offprint.content"; items: OffprintBlock[] };
// Derive from the generated lexicon but narrow `facets` to our branded
// `AtviewFacet` union and promote the optional `$type` to required.
export type AtviewContent = l.$Typed<Omit<NetAtviewDocumentMain, "facets">, "net.atview.document"> & {
    facets?: AtviewFacet[];
};

// Extend via `Omit` rather than intersection so we replace the open
// `Unknown$TypedObject` content slot with our concrete, branded-free types.
export type StandardDocumentLeaflet = Omit<StandardDocument, "content"> & {
    content: LeafletContent;
};

export type StandardDocumentPckt = Omit<StandardDocument, "content"> & {
    content: PcktContent;
};

export type StandardDocumentOffprint = Omit<StandardDocument, "content"> & {
    content: OffprintContent;
};

export type StandardDocumentAtview = Omit<StandardDocument, "content"> & {
    content: AtviewContent;
};

export type StandardDocumentExtended =
    | StandardDocumentLeaflet
    | StandardDocumentPckt
    | StandardDocumentOffprint
    | StandardDocumentAtview;
