import { describe, expect, test } from "vitest";

import { AtviewProvider } from "@src/core/providers";

describe("AtviewProvider.dataToAst", () => {
    test("plain and paragraph breaks", () => {
        expect(AtviewProvider.dataToAst({ textContent: "Hello world", facets: [] })).toEqual([
            { type: "paragraph", children: [{ type: "text", value: "Hello world" }] },
        ]);
        expect(AtviewProvider.dataToAst({ textContent: "First\n\nSecond", facets: [] }).length).toBe(2);
    });

    test("inline bold italic underline code", () => {
        const markedPlaintext = "alphabetagammadelta";
        const ast = AtviewProvider.dataToAst({
            textContent: markedPlaintext,
            facets: [
                { index: { byteStart: 0, byteEnd: 5 }, features: [{ $type: "net.atview.richtext.facet#b" }] },
                { index: { byteStart: 5, byteEnd: 9 }, features: [{ $type: "net.atview.richtext.facet#i" }] },
                { index: { byteStart: 9, byteEnd: 14 }, features: [{ $type: "net.atview.richtext.facet#u" }] },
                { index: { byteStart: 14, byteEnd: 19 }, features: [{ $type: "net.atview.richtext.facet#code" }] },
            ],
        });
        expect(ast[0]?.type).toBe("paragraph");
    });

    test("link and mention", () => {
        const ast = AtviewProvider.dataToAst({
            textContent: "linkmention",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 4 },
                    features: [{ $type: "net.atview.richtext.facet#link", uri: "https://example.com" }],
                },
                {
                    index: { byteStart: 4, byteEnd: 11 },
                    features: [{ $type: "net.atview.richtext.facet#mention", did: "did:plc:mention-user" }],
                },
            ],
        });
        expect(ast[0]?.type).toBe("paragraph");
    });

    test("block heading blockquote code-block lists", () => {
        const ast = AtviewProvider.dataToAst({
            textContent: "Title\n\nQuote\n\nconst x = 1\n\n- a\n- b\n\n1. one\n2. two",
            facets: [
                { index: { byteStart: 0, byteEnd: 5 }, features: [{ $type: "net.atview.richtext.facet#h2" }] },
                {
                    index: { byteStart: 7, byteEnd: 12 },
                    features: [{ $type: "net.atview.richtext.facet#blockquote" }],
                },
                {
                    index: { byteStart: 14, byteEnd: 25 },
                    features: [{ $type: "net.atview.richtext.facet#code-block", language: "ts" }],
                },
                { index: { byteStart: 27, byteEnd: 34 }, features: [{ $type: "net.atview.richtext.facet#ul" }] },
                { index: { byteStart: 36, byteEnd: 49 }, features: [{ $type: "net.atview.richtext.facet#ol" }] },
            ],
        });
        expect(ast.map((block) => block.type)).toEqual([
            "heading",
            "blockquote",
            "code-block",
            "unordered-list",
            "ordered-list",
        ]);
    });

    test("bsky-post media website facets", () => {
        const ast = AtviewProvider.dataToAst({
            textContent: "block-one\n\nblock-two\n\nblock-three",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 9 },
                    features: [
                        {
                            $type: "net.atview.richtext.facet#bsky-post",
                            uri: "at://example/post",
                            cid: "example-cid",
                        },
                    ],
                },
                {
                    index: { byteStart: 11, byteEnd: 20 },
                    features: [
                        {
                            $type: "net.atview.richtext.facet#media",
                            image: "bafyimage",
                            altText: "example-alt",
                            width: "100",
                            height: "200",
                        },
                    ],
                },
                {
                    index: { byteStart: 22, byteEnd: 33 },
                    features: [
                        {
                            $type: "net.atview.richtext.facet#website",
                            uri: "https://example.com",
                            title: "example-title",
                        },
                    ],
                },
            ],
        });
        expect(ast.map((block) => block.type)).toContain("bsky-post");
        expect(ast.map((block) => block.type)).toContain("media");
        expect(ast.map((block) => block.type)).toContain("website");
    });

    test("math and iframe facets", () => {
        const ast = AtviewProvider.dataToAst({
            textContent: "E = mc^2\n\nhttps://embed.example/x",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 8 },
                    features: [{ $type: "net.atview.richtext.facet#math", tex: "E = mc^2" }],
                },
                {
                    index: { byteStart: 10, byteEnd: 33 },
                    features: [{ $type: "net.atview.richtext.facet#iframe", url: "https://embed.example/x" }],
                },
            ],
        });
        expect(ast.map((b) => b.type)).toEqual(["math", "iframe"]);
        expect(ast[0]).toEqual({ type: "math", content: "E = mc^2" });
        expect(ast[1]).toEqual({ type: "iframe", url: "https://embed.example/x" });
    });
});
