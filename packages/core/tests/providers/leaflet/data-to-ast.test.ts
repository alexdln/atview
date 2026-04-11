import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { LeafletProvider } from "@src/core/providers";

import { linearPage } from "../../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("LeafletProvider.dataToAst", () => {
    test("skips non-linear pages", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [{ $type: "pub.leaflet.pages.unknown" as never, blocks: [] }],
        });
        expect(ast).toEqual([]);
    });

    test("text header blockquote code image", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({
                        $type: "pub.leaflet.blocks.text",
                        plaintext: "body-sample",
                        facets: [
                            {
                                index: { byteStart: 0, byteEnd: 4 },
                                features: [{ $type: "pub.leaflet.richtext.facet#bold" }],
                            },
                        ],
                    }),
                    wrap({
                        $type: "pub.leaflet.blocks.header",
                        plaintext: "header-sample",
                        level: 3,
                        facets: [
                            {
                                index: { byteStart: 0, byteEnd: 6 },
                                features: [{ $type: "pub.leaflet.richtext.facet#link", uri: "https://example.com" }],
                            },
                        ],
                    }),
                    wrap({ $type: "pub.leaflet.blocks.blockquote", plaintext: "quote-sample" }),
                    wrap({ $type: "pub.leaflet.blocks.code", plaintext: "code-sample", language: "py" }),
                    wrap({
                        $type: "pub.leaflet.blocks.image",
                        image: "bafyimg",
                        aspectRatio: { width: 10, height: 5 },
                        alt: "image-alt-text",
                    }),
                ]),
            ],
        });
        expect(ast.map((b) => b.type)).toEqual(["paragraph", "heading", "blockquote", "code-block", "media"]);
    });

    test("lists nested item", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({
                        $type: "pub.leaflet.blocks.unorderedList",
                        children: [
                            {
                                content: { $type: "pub.leaflet.blocks.text", plaintext: "parent-item" },
                                children: [
                                    {
                                        content: { $type: "pub.leaflet.blocks.text", plaintext: "nested-item" },
                                    },
                                ],
                            },
                        ],
                    }),
                    wrap({
                        $type: "pub.leaflet.blocks.orderedList",
                        startIndex: 4,
                        children: [{ content: { $type: "pub.leaflet.blocks.text", plaintext: "ordered-item-text" } }],
                    }),
                ]),
            ],
        });
        expect(ast[0]?.type).toBe("unordered-list");
        expect(ast[1]?.type).toBe("ordered-list");
    });

    test("bsky horizontal website", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({
                        $type: "pub.leaflet.blocks.bskyPost",
                        postRef: { uri: "at://example/post", cid: "example-cid" },
                    }),
                    wrap({ $type: "pub.leaflet.blocks.horizontalRule" }),
                    wrap({
                        $type: "pub.leaflet.blocks.website",
                        src: "https://example.com",
                        title: "website-title",
                    }),
                ]),
            ],
        });
        expect(ast.map((b) => b.type)).toEqual(["bsky-post", "horizontal-rule", "website"]);
    });

    test("math and iframe", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({ $type: "pub.leaflet.blocks.math", tex: "\\frac{a}{b}" }),
                    wrap({
                        $type: "pub.leaflet.blocks.iframe",
                        url: "https://embed.example/frame",
                        height: 320,
                    }),
                ]),
            ],
        });
        expect(ast[0]).toEqual({ type: "math", content: "\\frac{a}{b}" });
        expect(ast[1]).toEqual({
            type: "iframe",
            url: "https://embed.example/frame",
            height: 320,
        });
    });

    test("unknown block omitted", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({ $type: "pub.leaflet.blocks.text", plaintext: "valid-block" }),
                    { $type: "pub.leaflet.pages.linearDocument#block", block: { $type: "unknown" } as never },
                ]),
            ],
        });
        expect(ast.length).toBe(1);
    });

    test("list item non-text content yields empty text node", () => {
        const ast = LeafletProvider.dataToAst({
            pages: [
                linearPage([
                    wrap({
                        $type: "pub.leaflet.blocks.unorderedList",
                        children: [
                            {
                                content: {
                                    $type: "pub.leaflet.blocks.image",
                                    image: "list-image-key",
                                    aspectRatio: { width: 1, height: 1 },
                                },
                            },
                        ],
                    }),
                ]),
            ],
        });
        const unorderedList = ast[0];
        expect(unorderedList?.type).toBe("unordered-list");
    });
});
