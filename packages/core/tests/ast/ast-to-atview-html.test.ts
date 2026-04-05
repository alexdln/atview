import { describe, expect, test } from "vitest";

import { type AstDocument, astToAtviewHtml } from "@src/core/ast";
import { type Blob } from "@src/core/defs/document";

describe("astToAtviewHtml", () => {
    test("paragraph spacing", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "first-line" }] },
            { type: "paragraph", children: [{ type: "text", value: "second-line" }] },
        ];
        expect(astToAtviewHtml(ast)).toBe("first-line\n\nsecond-line");
    });

    test("escapes text and attributes", () => {
        const ast: AstDocument = [
            {
                type: "paragraph",
                children: [
                    {
                        type: "link",
                        uri: `https://example.com/path"a`,
                        children: [{ type: "text", value: '<>&"' }],
                    },
                ],
            },
        ];
        const html = astToAtviewHtml(ast);
        expect(html).not.toContain("<>&");
        expect(html).toContain("&lt;");
    });

    test("heading levels", () => {
        expect(
            astToAtviewHtml([{ type: "heading", level: 2, children: [{ type: "text", value: "heading-text" }] }]),
        ).toContain('data-tag="h2"');
    });

    test("code-block optional language", () => {
        expect(astToAtviewHtml([{ type: "code-block", text: "snippet" }])).toContain('data-tag="code-block"');
        expect(astToAtviewHtml([{ type: "code-block", text: "snippet", language: "ts" }])).toContain("language");
    });

    test("ordered-list start", () => {
        const html = astToAtviewHtml([
            {
                type: "ordered-list",
                start: 3,
                items: [{ children: [{ type: "text", value: "numbered-item" }] }],
            },
        ]);
        expect(html).toContain("3. ");
    });

    test("media uses authorDid in preview", () => {
        const html = astToAtviewHtml(
            [
                {
                    type: "media",
                    image: { $link: "bafyref" } as unknown as Blob,
                    text: "caption",
                    width: "400",
                    height: "200",
                },
            ],
            { authorDid: "did:plc:example-author" },
        );
        expect(html).toContain("did:plc:example-author");
    });

    test("horizontal-rule", () => {
        expect(astToAtviewHtml([{ type: "horizontal-rule" }])).toBe("<hr />");
    });

    test("website block", () => {
        const exampleTitle = "example-title";
        const html = astToAtviewHtml([{ type: "website", uri: "https://example.test/page", title: exampleTitle }]);
        expect(html).toContain('data-tag="website"');
        expect(html).toContain(exampleTitle);
    });

    test("table and iframe render empty", () => {
        expect(
            astToAtviewHtml([
                {
                    type: "table",
                    rows: [{ cells: [{ content: [{ type: "text", value: "cell-text" }] }] }],
                },
                { type: "iframe", url: "https://embed.example/frame" },
            ]),
        ).toBe("");
    });

    test("nested inline marks", () => {
        const html = astToAtviewHtml([
            {
                type: "paragraph",
                children: [
                    {
                        type: "bold",
                        children: [{ type: "italic", children: [{ type: "text", value: "nested-sample" }] }],
                    },
                ],
            },
        ]);
        expect(html).toContain('data-tag="b"');
        expect(html).toContain('data-tag="i"');
    });
});
