import { describe, expect, test } from "vitest";

import { type PcktBlock, type PcktListItem } from "@src/core/defs/document";
import { PcktProvider } from "@src/core/providers";

describe("PcktProvider.dataToAst", () => {
    test("text with facets", () => {
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.text",
                plaintext: "alphabeta",
                facets: [
                    {
                        index: { byteStart: 0, byteEnd: 5 },
                        features: [{ $type: "blog.pckt.richtext.facet#bold" }],
                    },
                    {
                        index: { byteStart: 5, byteEnd: 9 },
                        features: [{ $type: "blog.pckt.richtext.facet#link", uri: "https://example.com" }],
                    },
                ],
            },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast[0]?.type).toBe("paragraph");
    });

    test("empty text skipped", () => {
        expect(PcktProvider.dataToAst([{ $type: "blog.pckt.block.text", plaintext: "" }])).toEqual([]);
    });

    test("heading image website embed", () => {
        const items: PcktBlock[] = [
            { $type: "blog.pckt.block.heading", plaintext: "Sample heading", level: 3 },
            {
                $type: "blog.pckt.block.image",
                attrs: {
                    src: "https://example.com/image",
                    blob: "bafyblob",
                    alt: "image-description",
                },
            },
            {
                $type: "blog.pckt.block.website",
                src: "https://example.com",
                title: "Example website title",
            },
            {
                $type: "blog.pckt.block.blueskyEmbed",
                postRef: { uri: "at://example/post", cid: "example-cid" },
            },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast.map((b) => b.type)).toEqual(["heading", "media", "website", "bsky-post"]);
    });

    test("blockquote horizontal rule", () => {
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.blockquote",
                content: [{ $type: "blog.pckt.block.text", plaintext: "quote-body" }],
            },
            { $type: "blog.pckt.block.horizontalRule" },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast.map((b) => b.type)).toEqual(["blockquote", "horizontal-rule"]);
    });

    test("ordered and bullet lists", () => {
        const listItem = (text: string) =>
            ({
                $type: "blog.pckt.block.listItem" as const,
                content: [{ $type: "blog.pckt.block.text" as const, plaintext: text }],
            }) satisfies PcktListItem;
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.orderedList",
                attrs: { start: 3 },
                content: [listItem("ordered-item-text")],
            },
            {
                $type: "blog.pckt.block.bulletList",
                content: [listItem("bullet-item-text")],
            },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast[0]?.type).toBe("ordered-list");
        expect(ast[1]?.type).toBe("unordered-list");
    });

    test("table and iframe", () => {
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.table",
                content: [
                    {
                        $type: "blog.pckt.block.tableRow",
                        content: [
                            {
                                $type: "blog.pckt.block.tableCell",
                                attrs: { colspan: 2, rowspan: 1 },
                                content: [{ $type: "blog.pckt.block.text", plaintext: "table-cell-body" }],
                            },
                        ],
                    },
                ],
            },
            { $type: "blog.pckt.block.iframe", url: "https://embed.example/frame" },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast[0]?.type).toBe("table");
        expect(ast[1]?.type).toBe("iframe");
    });

    test("mention and strikethrough stacking", () => {
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.text",
                plaintext: "mention",
                facets: [
                    {
                        index: { byteStart: 0, byteEnd: 7 },
                        features: [
                            { $type: "blog.pckt.richtext.facet#didMention", did: "did:plc:example-user" },
                            { $type: "blog.pckt.richtext.facet#strikethrough" },
                        ],
                    },
                ],
            },
        ];
        const ast = PcktProvider.dataToAst(items);
        expect(ast[0]?.type).toBe("paragraph");
    });

    test("unknown block omitted", () => {
        expect(PcktProvider.dataToAst([{ $type: "blog.pckt.block.unknown" } as never])).toEqual([]);
    });
});
