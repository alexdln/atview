import { describe, expect, test } from "vitest";

import { astToHtml } from "@src/core/ast";
import { LeafletProvider } from "@src/core/providers";

import { parseHtmlToAst } from "../../helpers";

describe("LeafletProvider data html pipeline", () => {
    test("htmlToData matches astToData of parse", () => {
        const ast = [{ type: "paragraph" as const, children: [{ type: "text" as const, value: "paragraph-body" }] }];
        const root = document.createElement("div");
        root.innerHTML = astToHtml(ast);
        const via = LeafletProvider.htmlToData(root, new Map());
        const direct = LeafletProvider.astToData(parseHtmlToAst(root.innerHTML));
        expect(via.pages).toEqual(direct.pages);
        expect(via.engine).toBe("blocks");
    });
});
