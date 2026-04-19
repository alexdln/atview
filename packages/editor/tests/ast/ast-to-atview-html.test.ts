import { describe, expect, test } from "vitest";
import { type AstDocument, type Blob } from "@atview/core";

import { astToAtviewHtml } from "../../src/atview-html";

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
        expect(astToAtviewHtml(ast)).toBe(
            `<span data-tag="link" data-type="inline" data-record='{&quot;uri&quot;:&quot;https://example.com/path\\&quot;a&quot;}'>&lt;&gt;&amp;&quot;</span>`,
        );
    });

    test("heading levels", () => {
        expect(
            astToAtviewHtml([{ type: "heading", level: 2, children: [{ type: "text", value: "heading-text" }] }]),
        ).toBe(`<span data-tag="h2" data-type="block">heading-text</span>`);
    });

    test("code-block optional language", () => {
        expect(astToAtviewHtml([{ type: "code-block", text: "snippet" }])).toBe(
            `<span data-tag="code-block" data-type="block">snippet</span>`,
        );
        expect(astToAtviewHtml([{ type: "code-block", text: "snippet", language: "ts" }])).toBe(
            `<span data-tag="code-block" data-type="block" data-record='{&quot;language&quot;:&quot;ts&quot;}'>snippet</span>`,
        );
    });

    test("ordered-list start", () => {
        expect(
            astToAtviewHtml([
                {
                    type: "ordered-list",
                    start: 3,
                    items: [{ children: [{ type: "text", value: "numbered-item" }] }],
                },
            ]),
        ).toBe(`<span data-tag="ol" data-type="block">3. numbered-item</span>`);
    });

    test("media uses authorDid in preview", () => {
        const imageBlob = {
            $type: "blob" as const,
            ref: "bafyref",
            mimeType: "image/png",
            size: 10,
        } as unknown as Blob;
        expect(
            astToAtviewHtml(
                [
                    {
                        type: "media",
                        image: imageBlob,
                        text: "caption",
                        width: 400,
                        height: 200,
                    },
                ],
                { authorDid: "did:plc:example-author" },
            ),
        ).toBe(
            `<span data-tag="media" data-type="block" data-record='{&quot;image&quot;:{&quot;$type&quot;:&quot;blob&quot;,&quot;ref&quot;:&quot;bafyref&quot;,&quot;mimeType&quot;:&quot;image/png&quot;,&quot;size&quot;:10},&quot;alt&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;width&quot;:400,&quot;height&quot;:200}' style='--preview-url: url(https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:example-author/bafyref@jpeg);--aspect-ratio: 2'>caption</span>`,
        );
    });

    test("media block preview style uses thumbnail url for cover-style preview", () => {
        const imageBlob = {
            $type: "blob" as const,
            ref: "bafythumb",
            mimeType: "image/png",
            size: 10,
        } as unknown as Blob;
        expect(
            astToAtviewHtml(
                [
                    {
                        type: "media",
                        image: imageBlob,
                        text: "shown",
                        caption: "stored-caption",
                        width: 400,
                        height: 200,
                    },
                ],
                { authorDid: "did:plc:example-author" },
            ),
        ).toBe(
            `<span data-tag="media" data-type="block" data-record='{&quot;image&quot;:{&quot;$type&quot;:&quot;blob&quot;,&quot;ref&quot;:&quot;bafythumb&quot;,&quot;mimeType&quot;:&quot;image/png&quot;,&quot;size&quot;:10},&quot;alt&quot;:&quot;&quot;,&quot;caption&quot;:&quot;stored-caption&quot;,&quot;width&quot;:400,&quot;height&quot;:200}' style='--preview-url: url(https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:example-author/bafythumb@jpeg);--aspect-ratio: 2'>shown</span>`,
        );
    });

    test("horizontal-rule", () => {
        expect(astToAtviewHtml([{ type: "horizontal-rule" }])).toBe("<hr />");
    });

    test("website block", () => {
        const exampleTitle = "example-title";
        expect(astToAtviewHtml([{ type: "website", uri: "https://example.test/page", title: exampleTitle }])).toBe(
            `<span data-tag="website" data-type="block" data-record='{&quot;uri&quot;:&quot;https://example.test/page&quot;}'>example-title</span>`,
        );
    });

    test("math block", () => {
        const tex = "a < b";
        expect(astToAtviewHtml([{ type: "math", content: tex }])).toBe(
            `<span data-tag="math" data-type="block">a &lt; b</span>`,
        );
    });

    test("table renders empty; iframe renders block span", () => {
        expect(
            astToAtviewHtml([
                {
                    type: "table",
                    rows: [{ cells: [{ content: [{ type: "text", value: "cell-text" }] }] }],
                },
                { type: "iframe", url: "https://embed.example/frame" },
            ]),
        ).toBe(
            `<span data-tag="iframe" data-type="block" data-record='{&quot;url&quot;:&quot;https://embed.example/frame&quot;}'>https://embed.example/frame</span>`,
        );
    });

    test("nested inline marks", () => {
        expect(
            astToAtviewHtml([
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "bold",
                            children: [{ type: "italic", children: [{ type: "text", value: "nested-sample" }] }],
                        },
                    ],
                },
            ]),
        ).toBe(
            `<span data-tag="b" data-type="inline"><span data-tag="i" data-type="inline">nested-sample</span></span>`,
        );
    });
});
