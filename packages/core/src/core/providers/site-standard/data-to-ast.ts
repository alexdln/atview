import { type AstDocument } from "../../ast/types";

export const dataToAst = (data: { textContent?: string }): AstDocument => [
    { type: "paragraph", children: [{ type: "text", value: data.textContent ?? "" }] },
];
