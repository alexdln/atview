import { describe, expect, test } from "vitest";

import { type Facet } from "@src/core/defs/document";
import { AtviewProvider } from "@src/core/providers";

import { normalizeAtviewData } from "../../helpers";

const expectDataRoundTrip = (initial: { textContent: string; facets?: Facet[] }) => {
    const ast = AtviewProvider.dataToAst(initial);
    const back = AtviewProvider.astToData(ast);
    expect(normalizeAtviewData(back)).toEqual(normalizeAtviewData(initial));
};

describe("AtviewProvider dataToAst astToData", () => {
    test("plain text", () => {
        expectDataRoundTrip({ textContent: "Hello world", facets: [] });
    });

    test("two paragraphs", () => {
        expectDataRoundTrip({ textContent: "First\n\nSecond", facets: [] });
    });

    test("bold and italic facets", () => {
        expectDataRoundTrip({
            textContent: "bold and italic",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 4 },
                    features: [{ $type: "net.atview.richtext.facet#b" }],
                },
                {
                    index: { byteStart: 9, byteEnd: 15 },
                    features: [{ $type: "net.atview.richtext.facet#i" }],
                },
            ],
        });
    });

    test("link and mention", () => {
        expectDataRoundTrip({
            textContent: "link mention",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 4 },
                    features: [{ $type: "net.atview.richtext.facet#link", uri: "https://example.com" }],
                },
                {
                    index: { byteStart: 5, byteEnd: 12 },
                    features: [{ $type: "net.atview.richtext.facet#mention", did: "did:plc:test" }],
                },
            ],
        });
    });

    test("heading blockquote code-block", () => {
        expectDataRoundTrip({
            textContent: "Title\n\nQuote\n\nconst x = 1",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 5 },
                    features: [{ $type: "net.atview.richtext.facet#h2" }],
                },
                {
                    index: { byteStart: 7, byteEnd: 12 },
                    features: [{ $type: "net.atview.richtext.facet#blockquote" }],
                },
                {
                    index: { byteStart: 14, byteEnd: 25 },
                    features: [{ $type: "net.atview.richtext.facet#code-block", language: "ts" }],
                },
            ],
        });
    });

    test("unordered and ordered lists", () => {
        expectDataRoundTrip({
            textContent: "- a\n- b\n\n1. one\n2. two",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 7 },
                    features: [{ $type: "net.atview.richtext.facet#ul" }],
                },
                {
                    index: { byteStart: 9, byteEnd: 22 },
                    features: [{ $type: "net.atview.richtext.facet#ol" }],
                },
            ],
        });
    });

    test("media placeholder", () => {
        expectDataRoundTrip({
            textContent: "placeholder",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 11 },
                    features: [
                        {
                            $type: "net.atview.richtext.facet#media",
                            image: "bafyimage",
                            altText: "Alt",
                            width: "800",
                            height: "600",
                        },
                    ],
                },
            ],
        });
    });

    test("math facet", () => {
        expectDataRoundTrip({
            textContent: "E = mc^2",
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 8 },
                    features: [{ $type: "net.atview.richtext.facet#math", tex: "E = mc^2" }],
                },
            ],
        });
    });

    test("iframe facet", () => {
        const url = "https://embed.example/frame";
        expectDataRoundTrip({
            textContent: url,
            facets: [
                {
                    index: { byteStart: 0, byteEnd: 27 },
                    features: [{ $type: "net.atview.richtext.facet#iframe", url }],
                },
            ],
        });
    });
});
