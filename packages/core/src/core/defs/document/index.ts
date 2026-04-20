import * as SiteStandardDocument from "../../../lexicons/site/standard/document";
import {
    type LeafletContent,
    type PcktContent,
    type OffprintContent,
    type AtviewContent,
    type StandardDocumentExtended,
    type StandardDocument,
    type StandardDocumentLeaflet,
    type StandardDocumentPckt,
    type StandardDocumentOffprint,
    type StandardDocumentAtview,
} from "./standard";
import { type LeafletDocument } from "./leaflet";

export * from "./standard";
export * from "./leaflet";
export * from "./pckt";
export * from "./offprint";
export * from "./atview";
export * from "./shared";

export type Document = LeafletDocument | StandardDocumentExtended | StandardDocument;

export type DocumentRecord = {
    [x: string]: unknown;
};

export const isLeafletContent = (data: DocumentRecord): data is LeafletContent => data.$type === "pub.leaflet.content";

export const isPcktContent = (data: DocumentRecord): data is PcktContent => data.$type === "blog.pckt.content";

export const isOffprintContent = (data: DocumentRecord): data is OffprintContent =>
    data.$type === "app.offprint.content";

export const isAtviewContent = (data: DocumentRecord): data is AtviewContent => data.$type === "net.atview.document";

export const isLeafletMain = (data: DocumentRecord): data is LeafletDocument => data.$type === "pub.leaflet.document";

// Delegate to the generated Lexicon discriminator so the $type literal is always kept in sync.
export const isStandardSiteMain = (data: DocumentRecord): data is StandardDocument =>
    SiteStandardDocument.$isTypeOf(data);

export const isStandardSiteDetailed = (data: DocumentRecord): data is StandardDocumentExtended =>
    isStandardSiteMain(data) && "content" in data;

export const isStandardSiteLeaflet = (data: DocumentRecord): data is StandardDocumentLeaflet =>
    isStandardSiteDetailed(data) && Boolean(data.content && isLeafletContent(data.content));

export const isStandardSitePckt = (data: DocumentRecord): data is StandardDocumentPckt =>
    isStandardSiteDetailed(data) && Boolean(data.content && isPcktContent(data.content));

export const isStandardSiteOffprint = (data: DocumentRecord): data is StandardDocumentOffprint =>
    isStandardSiteDetailed(data) && Boolean(data.content && isOffprintContent(data.content));

export const isStandardSiteAtview = (data: DocumentRecord): data is StandardDocumentAtview =>
    isStandardSiteDetailed(data) && Boolean(data.content && isAtviewContent(data.content));
