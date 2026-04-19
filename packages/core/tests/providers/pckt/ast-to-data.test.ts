import { describe, expect, test } from "vitest";

import { PcktProvider } from "@src/core/providers";

describe("PcktProvider astToData / dataToAst hard-break", () => {
    test("hard-break round-trips as blog.pckt.block.hardBreak", () => {
        const ast = PcktProvider.dataToAst({
            items: [{ $type: "blog.pckt.block.hardBreak" }],
        });
        expect(ast).toEqual([{ type: "hard-break" }]);

        const { items } = PcktProvider.astToData(ast);
        expect(items).toEqual([{ $type: "blog.pckt.block.hardBreak" }]);
    });
});
