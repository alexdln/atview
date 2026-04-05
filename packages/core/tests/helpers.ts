import { atviewHtmlToAst } from "@src/core/ast";
import {
    type Facet,
    type LeafletDocument,
    type LeafletDocumentBlock,
    type LeafletLinearDocument,
    type StandardDocumentAtview,
    type StandardDocumentLeaflet,
} from "@src/core/defs/document";

export const sortFacets = (facets: Facet[]) =>
    [...facets].sort((first, second) =>
        first.index.byteStart !== second.index.byteStart
            ? first.index.byteStart - second.index.byteStart
            : first.index.byteEnd - second.index.byteEnd,
    );

export const normalizeAtviewData = (data: { textContent: string; facets?: Facet[] }) => ({
    textContent: data.textContent,
    facets: sortFacets(data.facets ?? []),
});

export const parseHtmlToAst = (html: string, objectStore = new Map<string, File>()) => {
    const root = document.createElement("div");
    root.innerHTML = html;
    return atviewHtmlToAst(root, objectStore);
};

export const minimalStandardAtview = (textContent: string, facets: Facet[] = []): StandardDocumentAtview => ({
    $type: "site.standard.document",
    site: "at://did:plc:test",
    path: "/example-path",
    title: "example-title",
    description: "example-description",
    coverImage: "bafycover",
    textContent,
    tags: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
    content: { $type: "net.atview.document", facets },
});

export const minimalStandardLeaflet = (
    pages: StandardDocumentLeaflet["content"]["pages"],
): StandardDocumentLeaflet => ({
    $type: "site.standard.document",
    site: "at://did:plc:test",
    path: "/example-path",
    title: "example-title",
    description: "example-description",
    coverImage: "bafycover",
    textContent: "derived",
    tags: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
    content: { $type: "pub.leaflet.content", pages },
});

export const minimalLeafletMain = (pages: LeafletDocument["pages"]): LeafletDocument => ({
    $type: "pub.leaflet.document",
    title: "example-title",
    author: "did:plc:test",
    pages,
});

export const linearPage = (blocks: LeafletDocumentBlock[]): LeafletLinearDocument => ({
    $type: "pub.leaflet.pages.linearDocument",
    blocks,
});
