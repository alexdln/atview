import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast/types";
import { LeafletProvider } from "@src/core/providers";

describe("LeafletProvider.astToData", () => {
    test("paragraph heading blockquote", () => {
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
        ];
        const { pages } = LeafletProvider.astToData(ast);
        expect(pages[0]?.$type).toBe("pub.leaflet.pages.linearDocument");
        expect(pages[0]?.blocks.length).toBe(3);
    });

    test("code-block media lists", () => {
        const ast: AstDocument = [
            { type: "code-block", text: "code-body", language: "rs" },
            {
                type: "media",
                image: "media-key",
                alt: "media-alt",
                width: "8",
                height: "4",
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
        ];
        const { pages } = LeafletProvider.astToData(ast);
        expect(pages[0]?.blocks.length).toBe(4);
    });

    test("bsky website hr drops table iframe", () => {
        const ast: AstDocument = [
            { type: "bsky-post", uri: "at://example/post", cid: "example-cid" },
            { type: "website", uri: "https://example.com", title: "website-title" },
            { type: "horizontal-rule" },
            { type: "table", rows: [] },
            { type: "iframe", url: "https://embed.example/frame" },
        ];
        const { pages } = LeafletProvider.astToData(ast);
        expect(pages[0]?.blocks.length).toBe(3);
    });
});
