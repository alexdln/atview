import { type Facet } from "@src/core/defs/document";

export interface BuildParams {
    textContent: string;
    facets: Facet[];
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
}

export const formatDocument = (data: BuildParams, metadata: Metadata) =>
    ({
        $type: "site.standard.document",
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
            facets: data.facets,
            coverImageAlt: metadata.coverImageAlt,
            // language: metadata.language,
        },
    }) as const;
