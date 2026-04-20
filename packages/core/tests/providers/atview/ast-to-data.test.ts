import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast";
import { AtviewProvider } from "@src/core/providers";

import { normalizeAtviewData } from "../../helpers";

describe("AtviewProvider.astToData", () => {
    test("paragraph only", () => {
        const ast: AstDocument = [{ type: "paragraph", children: [{ type: "text", value: "example-text" }] }];
        expect(normalizeAtviewData(AtviewProvider.astToData(ast))).toEqual(
            normalizeAtviewData({ textContent: "example-text", facets: [] }),
        );
    });

    test("nested link with bold", () => {
        const ast: AstDocument = [
            {
                type: "paragraph",
                children: [
                    {
                        type: "link",
                        uri: "https://example.com/path",
                        children: [{ type: "bold", children: [{ type: "text", value: "nested-bold-text" }] }],
                    },
                ],
            },
        ];
        const out = AtviewProvider.astToData(ast);
        expect(out.textContent).toContain("nested-bold-text");
        expect(out.facets.length).toBeGreaterThan(0);
    });

    test("heading blockquote code-block", () => {
        const ast: AstDocument = [
            { type: "heading", level: 5, children: [{ type: "text", value: "heading-sample" }] },
            { type: "blockquote", children: [{ type: "text", value: "quote-sample" }] },
            { type: "code-block", text: "code-sample", language: "go" },
        ];
        const out = AtviewProvider.astToData(ast);
        expect(out.facets.some((f) => f.features[0]?.$type === "net.atview.richtext.facet#h5")).toBe(true);
    });

    test("lists media ordered start", () => {
        const ast: AstDocument = [
            {
                type: "unordered-list",
                items: [{ children: [{ type: "text", value: "unordered-item" }] }],
            },
            {
                type: "ordered-list",
                start: 2,
                items: [{ children: [{ type: "text", value: "ordered-item" }] }],
            },
            {
                type: "media",
                text: "media-caption",
                image: "media-image-key",
                alt: "media-alt-text",
                width: 10,
                height: 20,
            },
        ];
        const out = AtviewProvider.astToData(ast);
        expect(out.facets.length).toBe(3);
    });

    test("bsky-post website horizontal-rule ignored blocks", () => {
        const ast: AstDocument = [
            { type: "bsky-post", uri: "at://example/post", cid: "example-cid", text: "embed-caption" },
            { type: "website", uri: "https://example.com", title: "website-title" },
            { type: "horizontal-rule" },
            { type: "table", rows: [] },
            { type: "iframe", url: "https://embed.example/frame" },
        ];
        const out = AtviewProvider.astToData(ast);
        expect(out.textContent).toBeDefined();
    });

    test("hard-break emits newline and hard-break facet", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "a" }] },
            { type: "hard-break" },
            { type: "paragraph", children: [{ type: "text", value: "b" }] },
        ];
        const out = normalizeAtviewData(AtviewProvider.astToData(ast));
        expect(out.textContent).toBe("a\n\n\n\n\nb");
        expect(out.facets).toEqual([
            {
                index: { byteStart: 3, byteEnd: 4 },
                features: [{ $type: "net.atview.richtext.facet#hardBreak" }],
            },
        ]);
    });
});
