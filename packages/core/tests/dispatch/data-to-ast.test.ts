import { describe, expect, test } from "vitest";

import { type StandardDocumentPckt, type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { dataToAst } from "@src/core/ast/data-to-ast";
import { AtviewProvider, LeafletProvider } from "@src/core/providers";

import { linearPage, minimalLeafletMain, minimalStandardAtview, minimalStandardLeaflet } from "../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("dataToAst dispatch", () => {
    test("standard atview", () => {
        const doc = minimalStandardAtview("example-greeting", []);
        expect(dataToAst(doc)).toEqual(AtviewProvider.dataToAst({ textContent: "example-greeting", facets: [] }));
    });

    test("leaflet main document", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "sample-paragraph" })])];
        const doc = minimalLeafletMain(pages);
        expect(dataToAst(doc)).toEqual(LeafletProvider.dataToAst({ pages }));
    });

    test("standard site leaflet unwraps pages", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "sample-paragraph" })])];
        const doc = minimalStandardLeaflet(pages);
        expect(dataToAst(doc)).toEqual(LeafletProvider.dataToAst({ pages }));
    });

    test("pckt standard document returns null", () => {
        const pckt: StandardDocumentPckt = {
            $type: "site.standard.document",
            site: "at://did:plc:example",
            path: "/example-path",
            title: "example-title",
            description: "example-description",
            coverImage: "bafy",
            textContent: "",
            tags: [],
            publishedAt: "2026-01-01T00:00:00.000Z",
            content: { $type: "blog.pckt.content", items: [] },
        };
        expect(dataToAst(pckt)).toBeNull();
    });
});
