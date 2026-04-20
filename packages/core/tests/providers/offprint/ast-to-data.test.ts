import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast";
import { OffprintProvider } from "@src/core/providers";

describe("OffprintProvider.astToData", () => {
    test("paragraph with bold and link round-trips", () => {
        const ast: AstDocument = [
            {
                type: "paragraph",
                children: [
                    { type: "bold", children: [{ type: "text", value: "hello" }] },
                    { type: "text", value: " " },
                    { type: "link", uri: "https://example.com", children: [{ type: "text", value: "world" }] },
                ],
            },
        ];
        const { items } = OffprintProvider.astToData(ast);
        expect(items).toHaveLength(1);
        const block = items[0];
        if (block?.$type === "app.offprint.block.text") {
            expect(block.plaintext).toBe("hello world");
            expect(block.facets?.length).toBe(2);
        } else {
            throw new Error("expected text block");
        }
    });

    test("headings map ast level 2-6 back to offprint 1-3", () => {
        const ast: AstDocument = [
            { type: "heading", level: 2, children: [{ type: "text", value: "A" }] },
            { type: "heading", level: 3, children: [{ type: "text", value: "B" }] },
            { type: "heading", level: 5, children: [{ type: "text", value: "C" }] },
        ];
        const { items } = OffprintProvider.astToData(ast);
        expect(items.map((item) => (item.$type === "app.offprint.block.heading" ? item.level : null))).toEqual([
            1, 2, 3,
        ]);
    });

    test("lists with sublists round-trip", () => {
        const ast: AstDocument = [
            {
                type: "unordered-list",
                items: [
                    {
                        children: [{ type: "text", value: "parent" }],
                        sublist: {
                            type: "unordered-list",
                            items: [{ children: [{ type: "text", value: "child" }] }],
                        },
                    },
                ],
            },
        ];
        const { items } = OffprintProvider.astToData(ast);
        expect(OffprintProvider.dataToAst({ items })).toEqual(ast);
    });

    test("task list round-trips without nesting", () => {
        const ast: AstDocument = [
            {
                type: "task-list",
                items: [
                    { checked: true, children: [{ type: "text", value: "done" }] },
                    { checked: false, children: [{ type: "text", value: "todo" }] },
                ],
            },
        ];
        const { items } = OffprintProvider.astToData(ast);
        expect(OffprintProvider.dataToAst({ items })).toEqual(ast);
    });

    test("code block round-trips", () => {
        const ast: AstDocument = [{ type: "code-block", text: "console.log(1)", language: "ts" }];
        const { items } = OffprintProvider.astToData(ast);
        expect(items).toEqual([{ $type: "app.offprint.block.codeBlock", code: "console.log(1)", language: "ts" }]);
    });

    test("media round-trips", () => {
        const ast: AstDocument = [{ type: "media", image: "bafy", alt: "alt", width: 800, height: 600, caption: "c" }];
        const { items } = OffprintProvider.astToData(ast);
        expect(items).toEqual([
            {
                $type: "app.offprint.block.image",
                blob: "bafy",
                alt: "alt",
                caption: "c",
                aspectRatio: { width: 800, height: 600 },
            },
        ]);
    });

    test("website, iframe, math, bsky-post, horizontal-rule", () => {
        const ast: AstDocument = [
            { type: "website", uri: "https://e.com", title: "E" },
            { type: "iframe", url: "https://embed" },
            { type: "math", content: "x^2" },
            { type: "bsky-post", uri: "at://post", cid: "cid" },
            { type: "horizontal-rule" },
        ];
        const { items } = OffprintProvider.astToData(ast);
        expect(items.map((item) => item.$type)).toEqual([
            "app.offprint.block.webBookmark",
            "app.offprint.block.webEmbed",
            "app.offprint.block.mathBlock",
            "app.offprint.block.blueskyPost",
            "app.offprint.block.horizontalRule",
        ]);
    });
});
