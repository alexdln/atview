import { describe, expect, test } from "vitest";

import { OffprintProvider } from "@src/core/providers";

describe("OffprintProvider.formatDocument", () => {
    test("builds standard document with offprint content", () => {
        const items = [
            { $type: "app.offprint.block.heading" as const, plaintext: "Title", level: 1 as const },
            { $type: "app.offprint.block.text" as const, plaintext: "body paragraph" },
        ];
        const doc = OffprintProvider.formatDocument(
            { items },
            {
                siteUri: "at://example-site",
                path: "/example-path",
                title: "DocumentTitle",
                description: "DocumentDescription",
                tags: ["example-tag"],
                publishedAt: "2026-01-01T00:00:00.000Z",
                coverImage: "bafy",
            },
        );
        expect(doc.$type).toBe("site.standard.document");
        expect(doc.content.$type).toBe("app.offprint.content");
        expect(doc.content.items).toEqual(items);
        expect(doc.textContent).toBe("Title\n\nbody paragraph");
    });

    test("textContent concatenates list and callout plaintext", () => {
        const doc = OffprintProvider.formatDocument(
            {
                items: [
                    { $type: "app.offprint.block.callout", plaintext: "tip" },
                    {
                        $type: "app.offprint.block.bulletList",
                        children: [
                            {
                                content: { $type: "app.offprint.block.text", plaintext: "first" },
                                children: [
                                    {
                                        content: { $type: "app.offprint.block.text", plaintext: "nested" },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                siteUri: "at://example",
                title: "T",
                description: "D",
                tags: [],
                publishedAt: "2026-01-01T00:00:00.000Z",
            },
        );
        expect(doc.textContent).toBe("tip\n\nfirst\nnested");
    });
});
