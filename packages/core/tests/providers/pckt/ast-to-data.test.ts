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

    test("task list round-trips", () => {
        const ast = PcktProvider.dataToAst({
            items: [
                {
                    $type: "blog.pckt.block.taskList",
                    content: [
                        {
                            $type: "blog.pckt.block.taskItem",
                            checked: true,
                            content: [{ $type: "blog.pckt.block.text", plaintext: "Ship feature" }],
                        },
                    ],
                },
            ],
        });
        const { items } = PcktProvider.astToData(ast);
        expect(PcktProvider.dataToAst({ items })).toEqual(ast);
    });
});
