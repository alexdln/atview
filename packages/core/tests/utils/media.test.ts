import { type CID } from "multiformats/cid";
import { describe, expect, test } from "vitest";

import { formatMediaUri } from "@src/core/utils/media";

describe("formatMediaUri", () => {
    test("string passthrough", () => {
        expect(formatMediaUri("bafyexampleimage")).toBe("bafyexampleimage");
    });

    test("undefined", () => {
        expect(formatMediaUri(undefined)).toBeUndefined();
    });

    test("blob ref builds cdn url", () => {
        const blob = {
            $type: "blob" as const,
            ref: { $link: "bafyref" } as unknown as CID,
            mimeType: "image/png",
            size: 10,
        };
        expect(formatMediaUri(blob, { authorDid: "did:plc:author" })).toBe(
            "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:author/bafyref@jpeg",
        );
    });

    test("thumbnail preview uses feed_thumbnail path (cover-style preview)", () => {
        const blob = {
            $type: "blob" as const,
            ref: { $link: "bafyref" } as unknown as CID,
            mimeType: "image/png",
            size: 10,
        };
        const thumb = formatMediaUri(blob, { authorDid: "did:plc:author", thumbnail: true });
        const full = formatMediaUri(blob, { authorDid: "did:plc:author", thumbnail: false });
        expect(thumb).toBe("https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:author/bafyref@jpeg");
        expect(full).toBe("https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:author/bafyref@jpeg");
    });
});
