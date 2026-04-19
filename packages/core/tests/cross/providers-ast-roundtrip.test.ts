import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast";
import { AtviewProvider, LeafletProvider, PcktProvider } from "@src/core/providers";

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
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "sample-paragraph" }] },
            {
                type: "task-list",
                items: [
                    { checked: false, children: [{ type: "text", value: "a" }] },
                    { checked: true, children: [{ type: "text", value: "b" }] },
                ],
            },
        ];
        const data = PcktProvider.astToData(ast);
        expect(PcktProvider.dataToAst(data)).toEqual(ast);
    });
});
