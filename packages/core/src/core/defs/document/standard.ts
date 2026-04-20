import { type AtviewFacet } from "./atview";
import { type LeafletLinearDocument } from "./leaflet";
import { type OffprintBlock } from "./offprint";
import { type PcktBlock } from "./pckt";
import { type Blob } from "./shared";

export type StandardDocument = {
    $type: "site.standard.document";
    site: string;
    path: string;
    title: string;
    description: string;
    coverImage: Blob | string;
    textContent: string;
    tags: string[];
    publishedAt: string;
    updatedAt?: string;
    bskyPostRef?: { uri: string };
};

export type LeafletContent = { $type: "pub.leaflet.content"; pages: LeafletLinearDocument[] };
export type PcktContent = { $type: "blog.pckt.content"; items: PcktBlock[] };
export type OffprintContent = { $type: "app.offprint.content"; items: OffprintBlock[] };
export type AtviewContent = {
    $type: "net.atview.document";
    facets?: AtviewFacet[];
    coverImageAlt?: string;
    language?: string;
};

export type StandardDocumentLeaflet = StandardDocument & {
    content: LeafletContent;
};

export type StandardDocumentPckt = StandardDocument & {
    content: PcktContent;
};

export type StandardDocumentOffprint = StandardDocument & {
    content: OffprintContent;
};

export type StandardDocumentAtview = StandardDocument & {
    content: AtviewContent;
};

export type StandardDocumentExtended =
    | StandardDocumentLeaflet
    | StandardDocumentPckt
    | StandardDocumentOffprint
    | StandardDocumentAtview;
