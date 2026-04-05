import { type Agent } from "@atproto/api";
import { describe, expect, test, vi } from "vitest";

import { type Facet } from "@src/core/defs/document";
import { AtviewProvider } from "@src/core/providers";

describe("AtviewProvider.processBlobs", () => {
    test("uploads string image keys and replaces with blob refs", async () => {
        const file = new File([Uint8Array.from([1, 2, 3])], "example.png", { type: "image/png" });
        const store = new Map([["object-store-key", file]]);
        const facets: Facet[] = [
            {
                index: { byteStart: 0, byteEnd: 0 },
                features: [{ $type: "net.atview.richtext.facet#media", image: "object-store-key" }],
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
                                    ref: { $link: "bafyupl" },
                                    size: 3,
                                },
                            },
                        }),
                    },
                },
            },
        } as unknown as Agent;
        const out = await AtviewProvider.processBlobs(facets, store, agent);
        expect(agent.com.atproto.repo.uploadBlob).toHaveBeenCalled();
        const firstFeature = out[0]?.features[0];
        expect(firstFeature && "image" in firstFeature && typeof firstFeature.image === "object").toBe(true);
    });

    test("skips non-string image", async () => {
        const facets: Facet[] = [
            {
                index: { byteStart: 0, byteEnd: 1 },
                features: [
                    {
                        $type: "net.atview.richtext.facet#media",
                        image: { $type: "blob", mimeType: "image/png", ref: { $link: "existing-blob" }, size: 1 },
                    },
                ],
            },
        ];
        const agent = { com: { atproto: { repo: { uploadBlob: vi.fn() } } } } as unknown as Agent;
        const out = await AtviewProvider.processBlobs(facets, new Map(), agent);
        expect(agent.com.atproto.repo.uploadBlob).not.toHaveBeenCalled();
        expect(out[0]?.features[0]).toEqual(facets[0]?.features[0]);
    });
});
