import { describe, expect, test } from "vitest";

import { PcktProvider } from "@src/core/providers";

describe("PcktProvider.formatDocument", () => {
    test("builds standard document with pckt content", () => {
        const items = [{ $type: "blog.pckt.block.text" as const, plaintext: "document-body" }];
        const doc = PcktProvider.formatDocument(
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
        expect(doc.content.$type).toBe("blog.pckt.content");
        expect(doc.textContent).toBe("document-body");
        expect(doc.content.items).toEqual(items);
    });
});
