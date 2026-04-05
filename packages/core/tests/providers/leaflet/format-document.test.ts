import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { LeafletProvider } from "@src/core/providers";

import { linearPage } from "../../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("LeafletProvider.formatDocument", () => {
    const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "page-plaintext" })])];
    const meta = {
        did: "did:plc:author",
        siteUri: "at://example-site",
        publication: "at://did:plc:author/pub.leaflet.publication/pubkey",
        path: "/example-path",
        title: "ExampleTitle",
        description: "ExampleDescription",
        tags: ["example-tag"],
        publishedAt: "2026-01-01T00:00:00.000Z",
        coverImage: "bafy",
    };

    test("pub.leaflet.document branch", () => {
        const doc = LeafletProvider.formatDocument("pub.leaflet.document", { pages }, meta);
        expect(doc.$type).toBe("pub.leaflet.document");
        expect(doc).toMatchObject({
            pages,
            coverImage: meta.coverImage,
            publishedAt: meta.publishedAt,
            publication: "pubkey",
            title: meta.title,
            description: meta.description,
            tags: meta.tags,
        });
    });

    test("site.standard.document branch", () => {
        const doc = LeafletProvider.formatDocument("site.standard.document", { pages }, meta);
        expect(doc.$type).toBe("site.standard.document");
        expect(doc.content.$type).toBe("pub.leaflet.content");
        expect(doc.textContent).toBe("page-plaintext");
    });
});
