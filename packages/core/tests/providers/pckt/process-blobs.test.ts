import { type Agent } from "@atproto/api";
import { describe, expect, test, vi } from "vitest";

import { type PcktBlock } from "@src/core/defs/document";
import { PcktProvider } from "@src/core/providers";

describe("PcktProvider.processBlobs", () => {
    test("replaces string blob on image block", async () => {
        const file = new File([Uint8Array.from([9])], "example.png", { type: "image/png" });
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.image",
                blob: "object-store-key",
                attrs: { src: "", blob: "object-store-key" },
            },
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
        const out = await PcktProvider.processBlobs(items, new Map([["object-store-key", file]]), agent);
        const image = out[0];
        expect(image?.$type).toBe("blog.pckt.block.image");
        if (image?.$type === "blog.pckt.block.image") {
            expect(typeof image.blob === "object" && image.blob && "$type" in image.blob).toBe(true);
            expect(typeof image.attrs.blob === "object" && image.attrs.blob && "$type" in image.attrs.blob).toBe(true);
        }
    });

    test("walks nested blockquote", async () => {
        const file = new File([Uint8Array.from([1])], "nested.png", { type: "image/png" });
        const items: PcktBlock[] = [
            {
                $type: "blog.pckt.block.blockquote",
                content: [
                    {
                        $type: "blog.pckt.block.image",
                        blob: "k",
                        attrs: { src: "", blob: "k" },
                    },
                ],
            },
        ];
        const agent = {
            com: {
                atproto: {
                    repo: {
                        uploadBlob: vi.fn().mockResolvedValue({
                            data: {
                                blob: {
                                    mimeType: "image/png",
                                    ref: { $link: "bafyinner" },
                                    size: 1,
                                },
                            },
                        }),
                    },
                },
            },
        } as unknown as Agent;
        const out = await PcktProvider.processBlobs(items, new Map([["k", file]]), agent);
        const inner = out[0]?.$type === "blog.pckt.block.blockquote" ? out[0].content[0] : null;
        expect(inner?.$type).toBe("blog.pckt.block.image");
        if (inner?.$type === "blog.pckt.block.image") {
            expect(typeof inner.blob === "object").toBe(true);
        }
    });
});
