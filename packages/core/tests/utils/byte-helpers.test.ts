import { describe, expect, test } from "vitest";

import { bytePositionToCharPosition, charPositionToBytePosition } from "@src/core/utils/byte-helpers";

describe("bytePositionToCharPosition", () => {
    test("ascii", () => {
        expect(bytePositionToCharPosition("alpha", 2)).toBe(2);
    });

    test("utf8 multi-byte", () => {
        const sample = "prefixésuffix";
        expect(bytePositionToCharPosition(sample, 6)).toBe(6);
        expect(bytePositionToCharPosition(sample, 8)).toBe(7);
    });
});

describe("charPositionToBytePosition", () => {
    test("ascii", () => {
        expect(charPositionToBytePosition("alpha", 2)).toBe(2);
    });

    test("utf8 multi-byte", () => {
        const sample = "prefixésuffix";
        expect(charPositionToBytePosition(sample, 7)).toBe(8);
    });
});

describe("roundtrip char byte", () => {
    test("stable for mixed string", () => {
        const raw = "prefix😀suffix";
        for (let index = 0; index <= raw.length; index++) {
            const byteOffset = charPositionToBytePosition(raw, index);
            expect(bytePositionToCharPosition(raw, byteOffset)).toBe(index);
        }
    });
});
