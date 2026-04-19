import { describe, expect, test } from "vitest";
import { LeafletProvider } from "@atview/core";

import { astToAtviewHtml, atviewHtmlToAst } from "../../../src/atview-html";
import { parseAtviewHtmlToAst } from "../../helpers";

describe("LeafletProvider data html pipeline", () => {
    test("atviewHtmlToData matches astToData of parse", () => {
        const ast = [{ type: "paragraph" as const, children: [{ type: "text" as const, value: "paragraph-body" }] }];
        const root = document.createElement("div");
        root.innerHTML = astToAtviewHtml(ast);
        const via = LeafletProvider.astToData(atviewHtmlToAst(root, new Map()));
        const direct = LeafletProvider.astToData(parseAtviewHtmlToAst(root.innerHTML));
        expect(via.pages).toEqual(direct.pages);
    });
});
