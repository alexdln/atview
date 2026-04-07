import { type Record } from "@atproto/api/dist/client/types/com/atproto/repo/listRecords";

import {
    type LeafletContent,
    type PcktContent,
    type AtviewContent,
    type StandardDocumentExtended,
    type StandardDocument,
    type StandardDocumentLeaflet,
    type StandardDocumentPckt,
    type StandardDocumentAtview,
} from "./standard";
import { type LeafletDocument } from "./leaflet";

export * from "./standard";
export * from "./leaflet";
export * from "./pckt";
export * from "./shared";

export type Document = LeafletDocument | StandardDocumentExtended | StandardDocument;

export const isLeafletContent = (data: Record["value"]): data is LeafletContent => data.$type === "pub.leaflet.content";

export const isPcktContent = (data: Record["value"]): data is PcktContent => data.$type === "blog.pckt.content";

export const isAtviewContent = (data: Record["value"]): data is AtviewContent => data.$type === "net.atview.document";

export const isLeafletMain = (data: Record["value"]): data is LeafletDocument => data.$type === "pub.leaflet.document";

export const isStandardSiteMain = (data: Record["value"]): data is StandardDocument =>
    data.$type === "site.standard.document";

export const isStandardSiteDetailed = (data: Record["value"]): data is StandardDocumentExtended =>
    data.$type === "site.standard.document" && "content" in data;

export const isStandardSiteLeaflet = (data: Record["value"]): data is StandardDocumentLeaflet =>
    isStandardSiteDetailed(data) && Boolean(data.content && isLeafletContent(data.content));

export const isStandardSitePckt = (data: Record["value"]): data is StandardDocumentPckt =>
    isStandardSiteDetailed(data) && Boolean(data.content && isPcktContent(data.content));

export const isStandardSiteAtview = (data: Record["value"]): data is StandardDocumentAtview =>
    isStandardSiteDetailed(data) && Boolean(data.content && isAtviewContent(data.content));
