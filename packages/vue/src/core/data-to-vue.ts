import { type Document, dataToAst } from "@atview/core";

import { astToVue, type RenderContext } from "./ast-to-vue";

export const dataToVue = <T extends Document>(post: T, context: RenderContext) => {
    const ast = dataToAst(post);

    if (!ast) return null;

    return astToVue(ast, context);
};
