import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { dataToAst } from "@src/core/ast/data-to-ast";
import { AtviewProvider, LeafletProvider, PcktProvider, SiteStandardProvider } from "@src/core/providers";

import {
    linearPage,
    minimalLeafletMain,
    minimalStandardAtview,
    minimalStandardLeaflet,
    minimalStandardPckt,
    minimalStandardPlain,
} from "../helpers";

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

    test("standard site pckt unwraps items", () => {
        const items = [{ $type: "blog.pckt.block.text" as const, plaintext: "pckt-paragraph" }];
        const doc = minimalStandardPckt(items);
        expect(dataToAst(doc)).toEqual(PcktProvider.dataToAst({ items }));
    });

    test("plain site.standard.document uses textContent as one paragraph", () => {
        const doc = minimalStandardPlain("a\n\nb");
        expect(dataToAst(doc)).toEqual(SiteStandardProvider.dataToAst({ textContent: "a\n\nb" }));
    });
});
