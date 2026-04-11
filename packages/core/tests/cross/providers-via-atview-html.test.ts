import { describe, expect, test } from "vitest";

import { astToAtviewHtml, type AstDocument } from "@src/core/ast";
import { AtviewProvider, LeafletProvider, PcktProvider } from "@src/core/providers";

import { parseAtviewHtmlToAst } from "../helpers";

describe("shared html between providers", () => {
    test("parsed ast roundtrips through atview and leaflet separately", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "shared-paragraph-body" }] },
            { type: "code-block", text: "shared-code-block" },
        ];
        const parsed = parseAtviewHtmlToAst(astToAtviewHtml(ast));
        expect(AtviewProvider.dataToAst(AtviewProvider.astToData(parsed))).toEqual(parsed);
        expect(LeafletProvider.dataToAst(LeafletProvider.astToData(parsed))).toEqual(parsed);
        expect(PcktProvider.dataToAst(PcktProvider.astToData(parsed))).toEqual(parsed);
    });

    test("math block roundtrips atview and leaflet", () => {
        const ast: AstDocument = [{ type: "math", content: "x^2 + y^2 = r^2" }];
        const parsed = parseAtviewHtmlToAst(astToAtviewHtml(ast));
        expect(parsed).toEqual(ast);
        expect(AtviewProvider.dataToAst(AtviewProvider.astToData(parsed))).toEqual(parsed);
        expect(LeafletProvider.dataToAst(LeafletProvider.astToData(parsed))).toEqual(parsed);
        expect(PcktProvider.astToData(parsed)).toEqual({ items: [] });
    });
});

describe("ast through each provider roundtrip", () => {
    test("atview", () => {
        const ast: AstDocument = [{ type: "paragraph", children: [{ type: "text", value: "sample-paragraph" }] }];
        const data = AtviewProvider.astToData(ast);
        expect(AtviewProvider.dataToAst(data)).toEqual(ast);
    });

    test("leaflet", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "sample-paragraph" }] },
            { type: "horizontal-rule" },
        ];
        const back = LeafletProvider.dataToAst(LeafletProvider.astToData(ast));
        expect(back).toEqual(ast);
    });

    test("pckt", () => {
        const ast: AstDocument = [{ type: "paragraph", children: [{ type: "text", value: "sample-paragraph" }] }];
        const data = PcktProvider.astToData(ast);
        expect(PcktProvider.dataToAst(data)).toEqual(ast);
    });
});
