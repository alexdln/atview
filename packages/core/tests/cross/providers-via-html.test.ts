import { describe, expect, test } from "vitest";

import { astToAtviewHtml, type AstDocument } from "@src/core/ast";
import { AtviewProvider, LeafletProvider } from "@src/core/providers";

import { parseHtmlToAst } from "../helpers";

describe("shared html between providers", () => {
    test("parsed ast roundtrips through atview and leaflet separately", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "shared-paragraph-body" }] },
            { type: "code-block", text: "shared-code-block" },
        ];
        const parsed = parseHtmlToAst(astToAtviewHtml(ast));
        expect(AtviewProvider.dataToAst(AtviewProvider.astToData(parsed))).toEqual(parsed);
        expect(LeafletProvider.dataToAst(LeafletProvider.astToData(parsed))).toEqual(parsed);
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
});
