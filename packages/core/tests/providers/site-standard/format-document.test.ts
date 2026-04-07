import { describe, expect, test } from "vitest";

import { SiteStandardProvider } from "@src/core/providers";

describe("SiteStandardProvider.formatDocument", () => {
    test("builds standard document without structured content", () => {
        const doc = SiteStandardProvider.formatDocument(
            { textContent: "plain-body" },
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
        expect("content" in doc).toBe(false);
        expect(doc.textContent).toBe("plain-body");
        expect(doc.site).toBe("at://example-site");
    });
});
