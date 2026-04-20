import { describe, expect, test } from "vitest";
import { type AtviewFacet, AtviewProvider } from "@atview/core";

import { astToAtviewHtml, atviewHtmlToAst } from "../../../src/atview-html";
import { normalizeAtviewData, parseAtviewHtmlToAst } from "../../helpers";

const expectFullRoundTrip = (
    initial: { textContent: string; facets?: AtviewFacet[] },
    context: { authorDid?: string } = {},
) => {
    const ast = AtviewProvider.dataToAst(initial);
    const html = astToAtviewHtml(ast, context);
    const astFromHtml = parseAtviewHtmlToAst(html);
    const data = AtviewProvider.astToData(astFromHtml);
    expect(normalizeAtviewData(data)).toEqual(normalizeAtviewData(initial));
};

describe("AtviewProvider data html pipeline", () => {
    test("plain paragraphs", () => {
        expectFullRoundTrip({ textContent: "First\n\nSecond", facets: [] });
    });

    test("adjacent inline facets", () => {
        expectFullRoundTrip({
            textContent: "FirstSecond",
            facets: [
                { index: { byteStart: 0, byteEnd: 5 }, features: [{ $type: "net.atview.richtext.facet#b" }] },
                { index: { byteStart: 5, byteEnd: 11 }, features: [{ $type: "net.atview.richtext.facet#i" }] },
            ],
        });
    });

    test("block facets after breaks", () => {
        expectFullRoundTrip({
            textContent: "Hello\n\nTitle\n\nQ\n\n`",
            facets: [
                { index: { byteStart: 0, byteEnd: 5 }, features: [{ $type: "net.atview.richtext.facet#b" }] },
                { index: { byteStart: 7, byteEnd: 12 }, features: [{ $type: "net.atview.richtext.facet#h3" }] },
                {
                    index: { byteStart: 14, byteEnd: 15 },
                    features: [{ $type: "net.atview.richtext.facet#blockquote" }],
                },
                {
                    index: { byteStart: 17, byteEnd: 18 },
                    features: [{ $type: "net.atview.richtext.facet#code-block" }],
                },
            ],
        });
    });

    test("list facet", () => {
        expectFullRoundTrip({
            textContent: "Prev text\n\n- i1\n- i2\n\nPost text",
            facets: [{ index: { byteStart: 11, byteEnd: 20 }, features: [{ $type: "net.atview.richtext.facet#ul" }] }],
        });
    });
});

describe("AtviewProvider.atviewHtmlToData", () => {
    test("mirrors astToData after parse", () => {
        const root = document.createElement("div");
        root.innerHTML = astToAtviewHtml([
            { type: "paragraph", children: [{ type: "text", value: "paragraph-sample" }] },
        ]);
        const via = AtviewProvider.astToData(atviewHtmlToAst(root, new Map()));
        const direct = AtviewProvider.astToData(parseAtviewHtmlToAst(root.innerHTML));
        expect(via.textContent).toBe(direct.textContent);
        expect(via.facets).toEqual(direct.facets);
    });
});
