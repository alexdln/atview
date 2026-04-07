import { describe, expect, test } from "vitest";

import { SiteStandardProvider } from "@src/core/providers";

describe("SiteStandardProvider.dataToAst", () => {
    test("wraps full text in a single paragraph", () => {
        expect(SiteStandardProvider.dataToAst({ textContent: "Hello" })).toEqual([
            { type: "paragraph", children: [{ type: "text", value: "Hello" }] },
        ]);
    });

    test("does not split on blank lines", () => {
        const text = "First\n\nSecond";
        expect(SiteStandardProvider.dataToAst({ textContent: text })).toEqual([
            { type: "paragraph", children: [{ type: "text", value: text }] },
        ]);
    });

    test("empty string", () => {
        expect(SiteStandardProvider.dataToAst({ textContent: "" })).toEqual([
            { type: "paragraph", children: [{ type: "text", value: "" }] },
        ]);
    });
});
