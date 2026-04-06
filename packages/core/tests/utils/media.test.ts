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
        expect(formatMediaUri(blob, { authorDid: "did:plc:author" })).toContain("did:plc:author");
        expect(formatMediaUri(blob, { authorDid: "did:plc:author" })).toContain("bafyref");
    });
});
