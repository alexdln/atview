import { type CID } from "multiformats/cid";
import { describe, expect, test } from "vitest";

import { formatMediaUri, formatMediaUris, getMediaUri } from "@src/core/utils/media";

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

describe("formatMediaUris", () => {
    test("returns default thumbnail and fullsize urls", () => {
        const blob = {
            $type: "blob" as const,
            ref: { $link: "bafyref" } as unknown as CID,
            mimeType: "image/png",
            size: 10,
        };
        expect(formatMediaUris(blob, { authorDid: "did:plc:author" })).toEqual({
            thumbnail: { jpeg: "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:author/bafyref@jpeg" },
            fullsize: { jpeg: "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:author/bafyref@jpeg" },
        });
    });

    test("supports custom loader and multiple formats", () => {
        const blob = {
            $type: "blob" as const,
            ref: { $link: "bafyref" } as unknown as CID,
            mimeType: "image/png",
            size: 10,
        };
        expect(
            formatMediaUris(blob, {
                authorDid: "did:plc:author",
                formats: ["jpeg", "webp"],
                sizes: ["thumbnail"],
                loader: ({ authorDid, format, image, size }) =>
                    `${authorDid}/${size}/${image.ref.toString()}.${format}`,
            }),
        ).toEqual({
            thumbnail: {
                jpeg: "did:plc:author/thumbnail/bafyref.jpeg",
                webp: "did:plc:author/thumbnail/bafyref.webp",
            },
        });
    });

    test("string input stays as a direct uri", () => {
        expect(formatMediaUris("https://cdn.example/image.png", { formats: ["jpeg", "webp"] })).toEqual({
            thumbnail: { jpeg: "https://cdn.example/image.png" },
            fullsize: { jpeg: "https://cdn.example/image.png" },
        });
    });
});

describe("getMediaUri", () => {
    test("reads a selected size and format", () => {
        const uris = formatMediaUris("https://cdn.example/image.png");
        expect(getMediaUri(uris, { size: "thumbnail" })).toBe("https://cdn.example/image.png");
    });
});
