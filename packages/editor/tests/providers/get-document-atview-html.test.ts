import { describe, expect, test } from "vitest";
import { type LeafletBlock, type LeafletDocumentBlock } from "@atview/core";

import { getDocumentAtviewHtml } from "../../src/atview-html";
import {
    linearPage,
    minimalLeafletMain,
    minimalStandardAtview,
    minimalStandardLeaflet,
    minimalStandardPckt,
    minimalStandardPlain,
} from "../../../core/tests/helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("getDocumentAtviewHtml", () => {
    test("atview facets engine", () => {
        const doc = minimalStandardAtview("example-body", []);
        const result = getDocumentAtviewHtml(doc, {});
        expect(result).toBe("example-body");
    });

    test("leaflet main old engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentAtviewHtml(minimalLeafletMain(pages), {});
        expect(result).toBe("example-body");
    });

    test("standard leaflet engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentAtviewHtml(minimalStandardLeaflet(pages), {});
        expect(result).toBe("example-body");
    });

    test("pckt blocks engine", () => {
        const doc = minimalStandardPckt([{ $type: "blog.pckt.block.text", plaintext: "example-body" }]);
        const result = getDocumentAtviewHtml(doc, {});
        expect(result).toBe("example-body");
    });

    test("plain site.standard.document (textContent only, single paragraph)", () => {
        const doc = minimalStandardPlain("Line one\n\nLine two");
        const result = getDocumentAtviewHtml(doc, {});
        expect(result).toBe("Line one\n\nLine two");
    });
});
