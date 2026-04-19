import { type AstBlockNode, type AstDocument } from "./types";

export type AstBlockTransformResult = AstBlockNode | undefined | null;

export type AstBlockTransform = (block: AstBlockNode) => AstBlockTransformResult;

export type AstBlockTransformAsync = (
    block: AstBlockNode,
) => AstBlockTransformResult | Promise<AstBlockTransformResult>;

export function transformAstBlocksSync(ast: AstDocument, transform: AstBlockTransform): AstDocument {
    const out: AstDocument = [];
    for (const block of ast) {
        const next = transform(block);

        if (next === null) continue;

        out.push(next === undefined ? block : next);
    }
    return out;
}

export async function transformAstBlocks(ast: AstDocument, transform: AstBlockTransformAsync): Promise<AstDocument> {
    const out: AstDocument = [];
    for (const block of ast) {
        const next = await transform(block);

        if (next === null) continue;

        out.push(next === undefined ? block : next);
    }
    return out;
}
