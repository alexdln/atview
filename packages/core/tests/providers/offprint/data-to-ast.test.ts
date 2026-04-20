import { describe, expect, test } from "vitest";

import { type OffprintBlock } from "@src/core/defs/document";
import { OffprintProvider } from "@src/core/providers";

describe("OffprintProvider.dataToAst", () => {
    test("text with inline facets", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.text",
                plaintext: "alphabeta",
                facets: [
                    {
                        index: { byteStart: 0, byteEnd: 5 },
                        features: [{ $type: "app.offprint.richtext.facet#bold" }],
                    },
                    {
                        index: { byteStart: 5, byteEnd: 9 },
                        features: [{ $type: "app.offprint.richtext.facet#link", uri: "https://example.com" }],
                    },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]?.type).toBe("paragraph");
        if (ast[0]?.type === "paragraph") {
            expect(ast[0].children.map((child) => child.type)).toEqual(["bold", "link"]);
        }
    });

    test("webMention facet becomes link", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.text",
                plaintext: "cite",
                facets: [
                    {
                        index: { byteStart: 0, byteEnd: 4 },
                        features: [
                            {
                                $type: "app.offprint.richtext.facet#webMention",
                                uri: "https://example.com/article",
                                title: "Example",
                            },
                        ],
                    },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        if (ast[0]?.type === "paragraph") {
            expect(ast[0].children[0]?.type).toBe("link");
        }
    });

    test("blockquote flattens inner text and heading", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.blockquote",
                content: [
                    { $type: "app.offprint.block.text", plaintext: "line1" },
                    { $type: "app.offprint.block.heading", plaintext: "line2", level: 2 },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]?.type).toBe("blockquote");
        if (ast[0]?.type === "blockquote") {
            expect(ast[0].children.map((child) => (child.type === "text" ? child.value : child.type))).toEqual([
                "line1",
                "\n",
                "line2",
            ]);
        }
    });

    test("callout maps to blockquote", () => {
        const items: OffprintBlock[] = [{ $type: "app.offprint.block.callout", plaintext: "Heads up!", emoji: "💡" }];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]?.type).toBe("blockquote");
    });

    test("bullet list with nested children", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.bulletList",
                children: [
                    {
                        content: { $type: "app.offprint.block.text", plaintext: "parent" },
                        children: [
                            {
                                content: { $type: "app.offprint.block.text", plaintext: "child" },
                            },
                        ],
                    },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]?.type).toBe("unordered-list");
        if (ast[0]?.type === "unordered-list") {
            expect(ast[0].items[0]?.sublist?.type).toBe("unordered-list");
        }
    });

    test("ordered list preserves start and nests as ordered", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.orderedList",
                start: 5,
                children: [
                    {
                        content: { $type: "app.offprint.block.text", plaintext: "item" },
                        children: [{ content: { $type: "app.offprint.block.text", plaintext: "nested" } }],
                    },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        if (ast[0]?.type === "ordered-list") {
            expect(ast[0].start).toBe(5);
            expect(ast[0].items[0]?.sublist?.type).toBe("ordered-list");
        } else {
            throw new Error("expected ordered-list");
        }
    });

    test("task list flattens nested task items", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.taskList",
                children: [
                    {
                        checked: false,
                        content: { $type: "app.offprint.block.text", plaintext: "outer" },
                        children: [
                            {
                                checked: true,
                                content: { $type: "app.offprint.block.text", plaintext: "inner" },
                            },
                        ],
                    },
                ],
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        if (ast[0]?.type === "task-list") {
            expect(ast[0].items.map((item) => item.checked)).toEqual([false, true]);
        } else {
            throw new Error("expected task-list");
        }
    });

    test("code block, horizontal rule, math", () => {
        const items: OffprintBlock[] = [
            { $type: "app.offprint.block.codeBlock", code: "print('hi')", language: "python" },
            { $type: "app.offprint.block.horizontalRule" },
            { $type: "app.offprint.block.mathBlock", tex: "E=mc^2" },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast.map((block) => block.type)).toEqual(["code-block", "horizontal-rule", "math"]);
    });

    test("image becomes media", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.image",
                blob: "bafyblob",
                alt: "img-alt",
                aspectRatio: { width: 800, height: 600 },
                caption: "image caption",
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]).toMatchObject({
            type: "media",
            image: "bafyblob",
            alt: "img-alt",
            width: 800,
            height: 600,
            caption: "image caption",
        });
    });

    test("image without blob is dropped", () => {
        const items: OffprintBlock[] = [{ $type: "app.offprint.block.image", alt: "no-blob" }];
        expect(OffprintProvider.dataToAst({ items })).toEqual([]);
    });

    test("web bookmark becomes website", () => {
        const items: OffprintBlock[] = [
            { $type: "app.offprint.block.webBookmark", href: "https://example.com", title: "Example" },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]).toEqual({ type: "website", uri: "https://example.com", title: "Example" });
    });

    test("web embed becomes iframe using embedUrl fallback to href", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.webEmbed",
                href: "https://youtu.be/x",
                embedUrl: "https://youtube.com/embed/x",
            },
            { $type: "app.offprint.block.webEmbed", href: "https://only-href.example" },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast).toEqual([
            { type: "iframe", url: "https://youtube.com/embed/x" },
            { type: "iframe", url: "https://only-href.example" },
        ]);
    });

    test("bluesky post block", () => {
        const items: OffprintBlock[] = [
            {
                $type: "app.offprint.block.blueskyPost",
                post: { uri: "at://did:plc:u/app.bsky.feed.post/3k", cid: "bafy" },
            },
        ];
        const ast = OffprintProvider.dataToAst({ items });
        expect(ast[0]).toEqual({
            type: "bsky-post",
            uri: "at://did:plc:u/app.bsky.feed.post/3k",
            cid: "bafy",
        });
    });

    test("unknown block type dropped", () => {
        expect(OffprintProvider.dataToAst({ items: [{ $type: "app.offprint.block.unknown" } as never] })).toEqual([]);
    });
});
