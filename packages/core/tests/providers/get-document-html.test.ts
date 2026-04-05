import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { getDocumentHtml } from "@src/core/providers";

import { linearPage, minimalLeafletMain, minimalStandardAtview, minimalStandardLeaflet } from "../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("getDocumentHtml", () => {
    test("atview facets engine", () => {
        const doc = minimalStandardAtview("example-body", []);
        const result = getDocumentHtml(doc, {});
        expect(result?.engine).toBe("atview_facets");
        expect(result?.html).toBeDefined();
    });

    test("leaflet main old engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentHtml(minimalLeafletMain(pages), {});
        expect(result?.engine).toBe("leaflet_blocks_old");
    });

    test("standard leaflet engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentHtml(minimalStandardLeaflet(pages), {});
        expect(result?.engine).toBe("leaflet_blocks");
    });

    test("pckt returns null", () => {
        expect(
            getDocumentHtml(
                {
                    $type: "site.standard.document",
                    site: "at://did:plc:example",
                    path: "/example-path",
                    title: "example-title",
                    description: "example-description",
                    coverImage: "bafy",
                    textContent: "",
                    tags: [],
                    publishedAt: "2026-01-01T00:00:00.000Z",
                    content: { $type: "blog.pckt.content", items: [] },
                },
                {},
            ),
        ).toBeNull();
    });
});
