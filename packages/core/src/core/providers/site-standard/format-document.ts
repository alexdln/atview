import * as site from "../../../lexicons/site";

export interface BuildParams {
    textContent: string;
}

export interface Metadata {
    siteUri: string;
    path?: string;
    title: string;
    description: string;
    tags: string[];
    publishedAt: string;
    coverImage?: unknown;
}

export const formatDocument = (data: BuildParams, metadata: Metadata) =>
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
    }) as const;
