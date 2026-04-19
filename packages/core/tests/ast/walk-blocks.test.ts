import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast/types";
import { transformAstBlocks, transformAstBlocksSync } from "@src/core/ast/walk-blocks";

describe("transformAstBlocksSync", () => {
    test("uses returned block when transform returns a node", () => {
        const ast: AstDocument = [{ type: "paragraph", children: [{ type: "text", value: "a" }] }];
        const next = transformAstBlocksSync(ast, (block) =>
            block.type === "paragraph" ? { ...block, children: [{ type: "text", value: "b" }] } : undefined,
        );
        expect(next[0]).toEqual({ type: "paragraph", children: [{ type: "text", value: "b" }] });
        expect(ast[0]).toEqual({ type: "paragraph", children: [{ type: "text", value: "a" }] });
    });

    test("null removes block", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "a" }] },
            { type: "horizontal-rule" },
        ];
        const next = transformAstBlocksSync(ast, (block) => (block.type === "horizontal-rule" ? null : undefined));
        expect(next).toHaveLength(1);
        expect(next[0]?.type).toBe("paragraph");
    });
});

describe("transformAstBlocks", () => {
    test("async transform can return replacement", async () => {
        const ast: AstDocument = [{ type: "paragraph", children: [{ type: "text", value: "x" }] }];
        const next = await transformAstBlocks(ast, async (block) =>
            block.type === "paragraph" ? { ...block, children: [{ type: "text", value: "y" }] } : undefined,
        );
        expect(next[0]).toEqual({ type: "paragraph", children: [{ type: "text", value: "y" }] });
    });
});
