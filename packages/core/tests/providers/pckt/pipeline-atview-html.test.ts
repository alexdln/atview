import { describe, expect, test } from "vitest";

import { astToAtviewHtml } from "@src/core/ast";
import { getDocumentAtviewHtml, PcktProvider } from "@src/core/providers";

import { minimalStandardPckt, parseAtviewHtmlToAst } from "../../helpers";

describe("PcktProvider dataToAtviewHtml", () => {
    test("renders paragraph from items", () => {
        const html = PcktProvider.dataToAtviewHtml(
            { items: [{ $type: "blog.pckt.block.text", plaintext: "pipeline-body" }] },
            {},
        );
        expect(html).toContain("pipeline-body");
    });

    test("empty items yields empty document html", () => {
        const html = PcktProvider.dataToAtviewHtml({ items: [] }, {});
        expect(html.trim()).toBe("");
    });
});

describe("Pckt REST-style document html", () => {
    test("getDocumentAtviewHtml aligns with dataToAtviewHtml", () => {
        const items = [
            { $type: "blog.pckt.block.heading" as const, plaintext: "Title", level: 2 },
            { $type: "blog.pckt.block.text" as const, plaintext: "Under heading" },
        ];
        const doc = minimalStandardPckt(items);
        const fromApi = getDocumentAtviewHtml(doc, {});
        const direct = PcktProvider.dataToAtviewHtml({ items }, {});
        expect(fromApi).toBe(direct);
    });
});

describe("PcktProvider.atviewHtmlToData", () => {
    test("mirrors astToData after parse", () => {
        const ast = PcktProvider.dataToAst({
            items: [{ $type: "blog.pckt.block.text", plaintext: "paragraph-sample" }],
        });
        const root = document.createElement("div");
        root.innerHTML = astToAtviewHtml(ast);
        const via = PcktProvider.atviewHtmlToData(root, new Map());
        const direct = PcktProvider.astToData(parseAtviewHtmlToAst(root.innerHTML));
        expect(via.items).toEqual(direct.items);
    });
});
