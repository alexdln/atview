import { describe, expect, test } from "vitest";
import { type AstDocument, realHtmlToAst, AtviewProvider, LeafletProvider, PcktProvider } from "@atview/core";

import { astToAtviewHtml, atviewHtmlToAst } from "../../src/atview-html";
import { parseAtviewHtmlToAst } from "../helpers";

describe("realHtmlToAst vs atview pseudo-html", () => {
    test("aligns with atview pseudo-html for equivalent structure", async () => {
        const pseudo =
            '<span data-tag="h3">Title</span><span data-tag="blockquote">Quote</span>Plain <span data-tag="b">bold</span> end';
        const root = document.createElement("div");
        root.innerHTML = pseudo;
        const fromPseudo = atviewHtmlToAst(root, new Map());
        const fromHtml = await realHtmlToAst(
            "<h3>Title</h3><blockquote>Quote</blockquote><p>Plain <strong>bold</strong> end</p>",
        );
        expect(fromHtml).toEqual(fromPseudo);
    });

    test("matches parseAtviewHtmlToAst for stored pseudo snippet", async () => {
        const pseudo = parseAtviewHtmlToAst('<span data-tag="link" data-record=\'{"uri":"u"}\'>t</span>');
        const fromReal = await realHtmlToAst('<p><a href="u">t</a></p>');
        expect(fromReal).toEqual(pseudo);
    });
});

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
