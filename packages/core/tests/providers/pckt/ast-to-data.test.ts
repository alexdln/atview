import { describe, expect, test } from "vitest";

import { type PcktCodeBlock } from "@src/core/defs/document";
import { type AstDocument } from "@src/core/ast/types";
import { PcktProvider } from "@src/core/providers";

describe("PcktProvider.astToData", () => {
    test("paragraph heading blockquote code-block", () => {
        const ast: AstDocument = [
            {
                type: "paragraph",
                children: [
                    {
                        type: "bold",
                        children: [{ type: "text", value: "bold-segment" }],
                    },
                ],
            },
            { type: "heading", level: 2, children: [{ type: "text", value: "heading-line" }] },
            { type: "blockquote", children: [{ type: "text", value: "quote-line" }] },
            { type: "code-block", text: "code-block-text", language: "javascript" },
        ];
        const { items } = PcktProvider.astToData(ast);
        expect(items.length).toBe(4);
        expect(items[0]?.$type).toBe("blog.pckt.block.text");
        expect(items[1]?.$type).toBe("blog.pckt.block.heading");
        expect(items[2]?.$type).toBe("blog.pckt.block.blockquote");
        expect(items[3]?.$type).toBe("blog.pckt.block.codeBlock");
        expect((items[3] as PcktCodeBlock).plaintext).toBe("code-block-text");
        expect((items[3] as PcktCodeBlock).language).toBe("javascript");
    });

    test("media lists link mention", () => {
        const ast: AstDocument = [
            {
                type: "media",
                image: "media-key",
                alt: "media-alt",
            },
            {
                type: "unordered-list",
                items: [{ children: [{ type: "text", value: "bullet-text" }] }],
            },
            {
                type: "ordered-list",
                start: 2,
                items: [{ children: [{ type: "text", value: "numbered-text" }] }],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "link",
                        uri: "https://example.com",
                        children: [{ type: "text", value: "link-text" }],
                    },
                ],
            },
        ];
        const { items } = PcktProvider.astToData(ast);
        expect(items.length).toBe(4);
        expect(items[0]?.$type).toBe("blog.pckt.block.image");
        expect(items[3]?.$type).toBe("blog.pckt.block.text");
        if (items[3]?.$type === "blog.pckt.block.text") {
            expect(items[3].facets?.[0]?.features[0]).toMatchObject({
                $type: "blog.pckt.richtext.facet#link",
                uri: "https://example.com",
            });
        }
    });

    test("bsky website hr table iframe", () => {
        const ast: AstDocument = [
            { type: "bsky-post", uri: "at://example/post", cid: "example-cid" },
            { type: "website", uri: "https://example.com", title: "website-title" },
            { type: "horizontal-rule" },
            { type: "table", rows: [] },
            { type: "iframe", url: "https://embed.example/frame" },
        ];
        const { items } = PcktProvider.astToData(ast);
        expect(items.map((b) => b.$type)).toEqual([
            "blog.pckt.block.blueskyEmbed",
            "blog.pckt.block.website",
            "blog.pckt.block.horizontalRule",
            "blog.pckt.block.table",
            "blog.pckt.block.iframe",
        ]);
    });
});
