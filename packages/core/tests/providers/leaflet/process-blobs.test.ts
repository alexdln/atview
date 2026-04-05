import { type Agent } from "@atproto/api";
import { describe, expect, test, vi } from "vitest";

import { type LeafletBlock, type LeafletDocumentBlock } from "@src/core/defs/document";
import { LeafletProvider } from "@src/core/providers";

import { linearPage } from "../../helpers";

const wrap = (block: LeafletBlock) =>
    ({
        $type: "pub.leaflet.pages.linearDocument#block" as const,
        block,
    }) satisfies LeafletDocumentBlock;

describe("LeafletProvider.processBlobs", () => {
    test("replaces string image with uploaded blob", async () => {
        const file = new File([Uint8Array.from([9])], "example.png", { type: "image/png" });
        const pages = [
            linearPage([
                wrap({
                    $type: "pub.leaflet.blocks.image",
                    image: "object-store-key",
                    aspectRatio: { width: 1, height: 1 },
                }),
            ]),
        ];
        const agent = {
            com: {
                atproto: {
                    repo: {
                        uploadBlob: vi.fn().mockResolvedValue({
                            data: {
                                blob: {
                                    mimeType: "image/png",
                                    ref: { $link: "bafyup" },
                                    size: 1,
                                },
                            },
                        }),
                    },
                },
            },
        } as unknown as Agent;
        const out = await LeafletProvider.processBlobs(pages, new Map([["object-store-key", file]]), agent);
        const imageBlock = out[0]?.blocks[0]?.block;
        expect(
            imageBlock && imageBlock.$type === "pub.leaflet.blocks.image" && typeof imageBlock.image === "object",
        ).toBe(true);
    });
});
