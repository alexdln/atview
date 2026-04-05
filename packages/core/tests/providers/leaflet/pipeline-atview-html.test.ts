import { describe, expect, test } from "vitest";

import { astToAtviewHtml } from "@src/core/ast";
import { LeafletProvider } from "@src/core/providers";

import { parseAtviewHtmlToAst } from "../../helpers";

describe("LeafletProvider data html pipeline", () => {
    test("atviewHtmlToData matches astToData of parse", () => {
        const ast = [{ type: "paragraph" as const, children: [{ type: "text" as const, value: "paragraph-body" }] }];
        const root = document.createElement("div");
        root.innerHTML = astToAtviewHtml(ast);
        const via = LeafletProvider.atviewHtmlToData(root, new Map());
        const direct = LeafletProvider.astToData(parseAtviewHtmlToAst(root.innerHTML));
        expect(via.pages).toEqual(direct.pages);
        expect(via.engine).toBe("blocks");
    });
});
