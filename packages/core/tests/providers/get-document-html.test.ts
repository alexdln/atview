import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { getDocumentHtml } from "@src/core/providers";

import {
    linearPage,
    minimalLeafletMain,
    minimalStandardAtview,
    minimalStandardLeaflet,
    minimalStandardPckt,
} from "../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("getDocumentHtml", () => {
    test("atview facets engine", () => {
        const doc = minimalStandardAtview("example-body", []);
        const result = getDocumentHtml(doc, {});
        expect(result?.engine).toBe("atview_facets");
        expect(result?.html).toBeDefined();
    });

    test("leaflet main old engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentHtml(minimalLeafletMain(pages), {});
        expect(result?.engine).toBe("leaflet_blocks_old");
    });

    test("standard leaflet engine", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "example-body" })])];
        const result = getDocumentHtml(minimalStandardLeaflet(pages), {});
        expect(result?.engine).toBe("leaflet_blocks");
    });

    test("pckt blocks engine", () => {
        const doc = minimalStandardPckt([{ $type: "blog.pckt.block.text", plaintext: "example-body" }]);
        const result = getDocumentHtml(doc, {});
        expect(result?.engine).toBe("pckt_blocks");
        expect(result?.html).toBeDefined();
        expect(result?.html).toContain("example-body");
    });
});
