import * as site from "../../../lexicons/site";
import { type AtviewFacet, type StandardDocumentAtview } from "../../defs/document";

export interface BuildParams {
    textContent: string;
    facets: AtviewFacet[];
}

export interface Metadata {
    siteUri: string;
    path?: string;
    title: string;
    description: string;
    tags: string[];
    publishedAt: string;
    coverImage?: unknown;
    coverImageAlt?: string;
    language?: string;
}

export const formatDocument = (data: BuildParams, metadata: Metadata): StandardDocumentAtview =>
    ({
        $type: site.standard.document.$type,
        site: metadata.siteUri,
        path: metadata.path,
        title: metadata.title,
        description: metadata.description,
        textContent: data.textContent,
        tags: metadata.tags,
        publishedAt: metadata.publishedAt,
        ...(metadata.coverImage ? { coverImage: metadata.coverImage } : {}),
        content: {
            $type: "net.atview.document",
            ...(data.facets.length > 0 ? { facets: data.facets } : {}),
            ...(metadata.coverImageAlt ? { coverImageAlt: metadata.coverImageAlt } : {}),
            ...(metadata.language ? { language: metadata.language } : {}),
        },
    }) as StandardDocumentAtview;
