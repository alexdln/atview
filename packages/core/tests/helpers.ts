import {
    type AtviewFacet,
    type LeafletDocument,
    type LeafletDocumentBlock,
    type LeafletLinearDocument,
    type StandardDocument,
    type StandardDocumentAtview,
    type StandardDocumentLeaflet,
    type StandardDocumentOffprint,
    type StandardDocumentPckt,
} from "../src/core/defs/document";
import * as site from "../src/lexicons/site";

const SITE_STANDARD_DOCUMENT = site.standard.document.$type;

export const sortFacets = <T extends AtviewFacet>(facets: T[]): T[] =>
    [...facets].sort((first, second) =>
        first.index.byteStart !== second.index.byteStart
            ? first.index.byteStart - second.index.byteStart
            : first.index.byteEnd - second.index.byteEnd,
    );

export const normalizeAtviewData = (data: { textContent: string; facets?: AtviewFacet[] }) => ({
    textContent: data.textContent,
    facets: sortFacets(data.facets ?? []),
});

const baseStandard = (): Omit<StandardDocument, "textContent"> => ({
    $type: SITE_STANDARD_DOCUMENT,
    site: "at://did:plc:test",
    path: "/example-path",
    title: "example-title",
    description: "example-description",
    coverImage: "bafycover",
    tags: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
});

export const minimalStandardPlain = (textContent: string): StandardDocument => ({
    ...baseStandard(),
    textContent,
});

export const minimalStandardAtview = (textContent: string, facets: AtviewFacet[] = []): StandardDocumentAtview => ({
    ...baseStandard(),
    textContent,
    content: { $type: "net.atview.document", facets },
});

export const minimalStandardLeaflet = (
    pages: StandardDocumentLeaflet["content"]["pages"],
): StandardDocumentLeaflet => ({
    ...baseStandard(),
    textContent: "derived",
    content: { $type: "pub.leaflet.content", pages },
});

export const minimalStandardPckt = (items: StandardDocumentPckt["content"]["items"]): StandardDocumentPckt => ({
    ...baseStandard(),
    textContent: "derived",
    content: { $type: "blog.pckt.content", items },
});

export const minimalStandardOffprint = (
    items: StandardDocumentOffprint["content"]["items"],
): StandardDocumentOffprint => ({
    ...baseStandard(),
    textContent: "derived",
    content: { $type: "app.offprint.content", items },
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
