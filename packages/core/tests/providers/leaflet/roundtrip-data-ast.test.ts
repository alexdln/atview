import { describe, expect, test } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { LeafletProvider } from "@src/core/providers";

import { linearPage } from "../../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("LeafletProvider dataToAst astToData", () => {
    test("single text block", () => {
        const pages = [linearPage([wrap({ $type: "pub.leaflet.blocks.text", plaintext: "hello" })])];
        const ast = LeafletProvider.dataToAst({ pages });
        const back = LeafletProvider.astToData(ast);
        expect(back.pages[0]?.blocks.length).toBe(1);
        const firstBlock = back.pages[0]?.blocks[0]?.block;
        expect(firstBlock && "plaintext" in firstBlock && firstBlock.plaintext).toBe("hello");
    });

    test("header and code", () => {
        const pages = [
            linearPage([
                wrap({ $type: "pub.leaflet.blocks.header", plaintext: "header-plaintext", level: 4 }),
                wrap({ $type: "pub.leaflet.blocks.code", plaintext: "code-plaintext", language: "ts" }),
            ]),
        ];
        const ast = LeafletProvider.dataToAst({ pages });
        const back = LeafletProvider.astToData(ast);
        expect(LeafletProvider.dataToAst(back)).toEqual(ast);
    });

    test("math and iframe", () => {
        const pages = [
            linearPage([
                wrap({ $type: "pub.leaflet.blocks.math", tex: "E = mc^2" }),
                wrap({
                    $type: "pub.leaflet.blocks.iframe",
                    url: "https://embed.example/frame",
                    height: 400,
                }),
            ]),
        ];
        const ast = LeafletProvider.dataToAst({ pages });
        const back = LeafletProvider.astToData(ast);
        expect(LeafletProvider.dataToAst(back)).toEqual(ast);
    });
});
