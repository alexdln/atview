import { describe, expect, test } from "vitest";

import { atviewHtmlToAst } from "@src/core/ast";

import { parseAtviewHtmlToAst } from "../helpers";

describe("atviewHtmlToAst", () => {
    test("plain text to paragraphs", () => {
        const root = document.createElement("div");
        root.textContent = "first-block\n\nsecond-block";
        const ast = atviewHtmlToAst(root, new Map());
        expect(ast).toEqual([
            { type: "paragraph", children: [{ type: "text", value: "first-block" }] },
            { type: "paragraph", children: [{ type: "text", value: "second-block" }] },
        ]);
    });

    test("inline tags map to ast", () => {
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="b"><span data-tag="i"><span data-tag="u"><span data-tag="code"><span data-tag="s"><span data-tag="mark">nested-inline</span></span></span></span></span></span>',
        );
        expect(ast[0]?.type).toBe("paragraph");
    });

    test("link and mention parse record json", () => {
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="link" data-record=\'{"uri":"https://example.com"}\'>link-label</span><span data-tag="mention" data-record=\'{"did":"did:plc:mention-user"}\'>mention-label</span>',
        );
        const paragraph = ast[0];
        expect(paragraph?.type).toBe("paragraph");
    });

    test("heading blockquote code-block ul ol", () => {
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="h4">heading-sample</span><span data-tag="blockquote">quote-sample</span><span data-tag="code-block" data-record=\'{"language":"rs"}\'>code-body</span><span data-tag="ul">- list-one\n- list-two</span><span data-tag="ol">2. ordered-one\n3. ordered-two</span>',
        );
        expect(ast.map((b) => b.type)).toEqual([
            "heading",
            "blockquote",
            "code-block",
            "unordered-list",
            "ordered-list",
        ]);
    });

    test("bsky-post and media", () => {
        const store = new Map<string, File>();
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="bsky-post" data-record=\'{"uri":"at://example/post","cid":"example-cid"}\'>\u200b</span><span data-tag="media" data-record=\'{"image":"object-key","alt":"","width":"","height":""}\'>media-caption</span>',
            store,
        );
        expect(ast[0]?.type).toBe("bsky-post");
        expect(ast[1]?.type).toBe("media");
    });

    test("media data-record caption is distinct from span text", () => {
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="media" data-record=\'{"image":"k","alt":"a","caption":"cap","width":"1","height":"2"}\'>visible</span>',
            new Map(),
        );
        const media = ast[0];
        expect(media?.type).toBe("media");
        if (media?.type === "media") {
            expect(media.text).toBe("visible");
            expect(media.caption).toBe("cap");
            expect(media.alt).toBe("a");
            expect(media.width).toBe(1);
            expect(media.height).toBe(2);
        }
    });

    test("math block span", () => {
        const ast = parseAtviewHtmlToAst('<span data-tag="math" data-type="block">\\sum_{i=1}^n i</span>');
        expect(ast[0]).toEqual({ type: "math", content: "\\sum_{i=1}^n i" });
    });

    test("objectStore injects file into parsed media record", () => {
        const file = new File([], "example.png", { type: "image/png" });
        const store = new Map([["object-key", file]]);
        const ast = parseAtviewHtmlToAst(
            '<span data-tag="media" data-record=\'{"image":"object-key"}\'></span>',
            store,
        );
        const mediaBlock = ast[0];
        expect(mediaBlock?.type).toBe("media");
    });

    test("strips zero width space from text", () => {
        const ast = parseAtviewHtmlToAst(`<span data-tag="b">before\u200Bafter</span>`);
        const paragraph = ast[0];
        expect(paragraph?.type).toBe("paragraph");
    });

    test("invalid json record falls back", () => {
        const ast = parseAtviewHtmlToAst('<span data-tag="link" data-record="not-json">fallback-text</span>');
        expect(ast.length).toBeGreaterThan(0);
    });

    test("should separate paragraphs with inline elements", async () => {
        const ast =
            parseAtviewHtmlToAst(`<span data-tag="link" data-type="inline" data-record="{&quot;uri&quot;:&quot;https://example.com&quot;}">example.com</span>

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`);
        expect(ast).toHaveLength(2);
        expect(ast[0]).toEqual({
            type: "paragraph",
            children: [
                {
                    type: "link",
                    uri: "https://example.com",
                    children: [{ type: "text", value: "example.com" }],
                },
            ],
        });
        expect(ast[1]).toEqual({
            type: "paragraph",
            children: [
                {
                    type: "text",
                    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                },
            ],
        });
    });
});

describe("atviewHtmlToAst edge document shapes", () => {
    test("empty container", () => {
        const root = document.createElement("div");
        expect(atviewHtmlToAst(root, new Map())).toEqual([]);
    });
});
