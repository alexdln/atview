import { describe, expect, test } from "vitest";

import { SiteStandardProvider } from "@src/core/providers";

describe("SiteStandardProvider.astToData", () => {
    test("round-trips with dataToAst", () => {
        const initial = { textContent: "Line one\n\nLine two" };
        expect(SiteStandardProvider.astToData(SiteStandardProvider.dataToAst(initial))).toEqual(initial);
    });

    test("joins multiple paragraphs with blank lines", () => {
        const ast = [
            { type: "paragraph" as const, children: [{ type: "text" as const, value: "A" }] },
            { type: "paragraph" as const, children: [{ type: "text" as const, value: "B" }] },
        ];
        expect(SiteStandardProvider.astToData(ast)).toEqual({ textContent: "A\n\nB" });
    });

    test("hard-break inserts a single newline with paragraph separators", () => {
        const ast = [
            { type: "paragraph" as const, children: [{ type: "text" as const, value: "a" }] },
            { type: "hard-break" as const },
            { type: "paragraph" as const, children: [{ type: "text" as const, value: "b" }] },
        ];
        expect(SiteStandardProvider.astToData(ast)).toEqual({ textContent: "a\n\n\nb" });
    });
});
