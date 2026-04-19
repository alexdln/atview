import { describe, expect, test } from "vitest";

import { type AstDocument } from "@src/core/ast";
import { astToPlainText } from "@src/core/ast";

describe("astToPlainText", () => {
    test("hard-break block renders as br tag token", () => {
        const ast: AstDocument = [{ type: "hard-break" }];
        expect(astToPlainText(ast, {})).toBe("\n");
    });

    test("hard-break between paragraphs", () => {
        const ast: AstDocument = [
            { type: "paragraph", children: [{ type: "text", value: "a" }] },
            { type: "hard-break" },
            { type: "paragraph", children: [{ type: "text", value: "b" }] },
        ];
        expect(astToPlainText(ast, {})).toBe("a\n\n\nb");
    });
});
