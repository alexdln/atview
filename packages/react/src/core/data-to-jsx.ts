import { type Document, dataToAst } from "@atview/core";

import { astToJsx, type RenderContext } from "./ast-to-jsx";

export const dataToJsx = <T extends Document>(post: T, context: RenderContext) => {
    const ast = dataToAst(post);

    if (!ast) return null;

    return astToJsx(ast, context);
};
