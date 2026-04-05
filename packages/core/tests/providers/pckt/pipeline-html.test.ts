import { describe, expect, test } from "vitest";

import { astToAtviewHtml } from "@src/core/ast";
import { getDocumentHtml, PcktProvider } from "@src/core/providers";

import { minimalStandardPckt, parseHtmlToAst } from "../../helpers";

describe("PcktProvider dataToHtml", () => {
    test("renders paragraph from items", () => {
        const html = PcktProvider.dataToHtml(
            { items: [{ $type: "blog.pckt.block.text", plaintext: "pipeline-body" }] },
            {},
        );
        expect(html).toContain("pipeline-body");
    });

    test("empty items yields empty document html", () => {
        const html = PcktProvider.dataToHtml({ items: [] }, {});
        expect(html.trim()).toBe("");
    });
});

describe("Pckt REST-style document html", () => {
    test("getDocumentHtml aligns with dataToHtml", () => {
        const items = [
            { $type: "blog.pckt.block.heading" as const, plaintext: "Title", level: 2 },
            { $type: "blog.pckt.block.text" as const, plaintext: "Under heading" },
        ];
        const doc = minimalStandardPckt(items);
        const fromApi = getDocumentHtml(doc, {});
        const direct = PcktProvider.dataToHtml({ items }, {});
        expect(fromApi?.engine).toBe("pckt_blocks");
        expect(fromApi?.html).toBe(direct);
    });
});

describe("PcktProvider.htmlToData", () => {
    test("mirrors astToData after parse", () => {
        const ast = PcktProvider.dataToAst([{ $type: "blog.pckt.block.text", plaintext: "paragraph-sample" }]);
        const root = document.createElement("div");
        root.innerHTML = astToAtviewHtml(ast);
        const via = PcktProvider.htmlToData(root, new Map());
        const direct = PcktProvider.astToData(parseHtmlToAst(root.innerHTML));
        expect(via.items).toEqual(direct.items);
        expect(via.engine).toBe("pckt_blocks");
    });
});
