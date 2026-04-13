import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast/types";
import { astToAtviewHtml } from "@src/core/ast";

import { parseAtviewHtmlToAst } from "../helpers";

const expectAstHtmlRoundTrip = (ast: AstDocument, context: { authorDid?: string } = {}) => {
    const html = astToAtviewHtml(ast, context);
    const again = parseAtviewHtmlToAst(html);
    expect(again).toEqual(ast);
};

describe("astToAtviewHtml then atviewHtmlToAst", () => {
    test("paragraphs and inline marks", () => {
        expectAstHtmlRoundTrip([
            { type: "paragraph", children: [{ type: "text", value: "opening" }] },
            {
                type: "paragraph",
                children: [
                    { type: "bold", children: [{ type: "text", value: "strong" }] },
                    { type: "text", value: " " },
                    {
                        type: "link",
                        uri: "https://example.test/path",
                        children: [{ type: "text", value: "link-text" }],
                    },
                ],
            },
        ]);
    });

    test("strikethrough and highlight", () => {
        expectAstHtmlRoundTrip([
            {
                type: "paragraph",
                children: [
                    { type: "strikethrough", children: [{ type: "text", value: "struck" }] },
                    { type: "highlight", children: [{ type: "text", value: "marked" }] },
                ],
            },
        ]);
    });

    test("heading blockquote code-block specials", () => {
        expectAstHtmlRoundTrip([
            { type: "heading", level: 3, children: [{ type: "text", value: "title-text" }] },
            { type: "blockquote", children: [{ type: "text", value: "Quote" }] },
            { type: "code-block", language: "js", text: "a < b && b > c" },
        ]);
    });

    test("lists and media", () => {
        expectAstHtmlRoundTrip([
            {
                type: "unordered-list",
                items: [
                    { children: [{ type: "text", value: "bullet-one" }] },
                    { children: [{ type: "text", value: "bullet-two" }] },
                ],
            },
            {
                type: "ordered-list",
                items: [{ children: [{ type: "text", value: "ordered-one" }] }],
            },
            {
                type: "media",
                image: "bafymedia",
                text: "image",
                alt: "pic",
                width: 400,
                height: 300,
            },
        ]);
    });

    test("media caption roundtrips separately from facet text", () => {
        expectAstHtmlRoundTrip([
            {
                type: "media",
                image: "bafymedia",
                text: "facet-range-text",
                caption: "metadata-caption",
                alt: "alt-text",
                width: 800,
                height: 600,
            },
        ]);
    });

    test("bsky-post uri cid", () => {
        expectAstHtmlRoundTrip([
            {
                type: "bsky-post",
                uri: "at://did:plc:example/app.bsky.feed.post/abc",
                cid: "bafycid",
            },
        ]);
    });

    test("math block", () => {
        expectAstHtmlRoundTrip([{ type: "math", content: "x^2 + y^2 = r^2" }]);
    });

    test("double html round trip stable", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "first-paragraph" }] },
            { type: "paragraph", children: [{ type: "text", value: "second-paragraph" }] },
            { type: "code-block", text: "code-sample" },
        ];
        const once = parseAtviewHtmlToAst(astToAtviewHtml(ast));
        const twice = parseAtviewHtmlToAst(astToAtviewHtml(once));
        expect(twice).toEqual(once);
    });
});
