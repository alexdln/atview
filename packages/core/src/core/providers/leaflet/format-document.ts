import { AtUri } from "@atproto/api";

import { type LeafletLinearDocument } from "@src/core/defs/document";

export interface BuildParams {
    pages: LeafletLinearDocument[];
}

export interface Metadata {
    did: string;
    siteUri: string;
    publication: string;
    path?: string;
    title: string;
    description: string;
    tags: string[];
    publishedAt: string;
    coverImage?: unknown;
}

const extractPlainText = (pages: LeafletLinearDocument[]) =>
    pages
        .flatMap((page) => page.blocks.map(({ block }) => ("plaintext" in block ? block.plaintext : "")))
        .filter(Boolean)
        .join("\n\n");

export const formatDocument = (documentType: string, data: BuildParams, metadata: Metadata) => {
    if (documentType === "pub.leaflet.document") {
        return {
            $type: "pub.leaflet.document",
            title: metadata.title,
            author: metadata.did,
            pages: data.pages,
            tags: metadata.tags,
            description: metadata.description,
            publishedAt: metadata.publishedAt,
            publication: new AtUri(metadata.publication).rkey,
            ...(metadata.coverImage ? { coverImage: metadata.coverImage } : {}),
        } as const;
    }

    return {
        $type: "site.standard.document",
        site: metadata.siteUri,
        path: metadata.path,
        title: metadata.title,
        description: metadata.description,
        textContent: extractPlainText(data.pages),
        content: { $type: "pub.leaflet.content", pages: data.pages },
        tags: metadata.tags,
        publishedAt: metadata.publishedAt,
        ...(metadata.coverImage ? { coverImage: metadata.coverImage } : {}),
    } as const;
};
