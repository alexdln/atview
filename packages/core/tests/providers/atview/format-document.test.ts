import { describe, expect, test } from "vitest";

import { AtviewProvider } from "@src/core/providers";

describe("AtviewProvider.formatDocument", () => {
    test("builds standard document with atview content", () => {
        const doc = AtviewProvider.formatDocument(
            {
                textContent: "document-body",
                facets: [
                    {
                        index: { byteStart: 0, byteEnd: 5 },
                        features: [{ $type: "net.atview.richtext.facet#b" }],
                    },
                ],
            },
            {
                siteUri: "at://example-site",
                path: "/example-path",
                title: "DocumentTitle",
                description: "DocumentDescription",
                tags: ["example-tag"],
                publishedAt: "2026-01-01T00:00:00.000Z",
                coverImage: "bafy",
                coverImageAlt: "cover-alt-text",
            },
        );
        expect(doc.$type).toBe("site.standard.document");
        expect(doc.content.$type).toBe("net.atview.document");
        expect(doc.textContent).toBe("document-body");
        expect(doc.content.facets?.length).toBe(1);
    });
});
