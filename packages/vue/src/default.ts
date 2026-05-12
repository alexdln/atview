import { type AstDocument, type Document } from "@atview/core";
import { InlineElements, BlockElements } from "./core/components";
import { astToVue as astToVueCore, type RenderContext } from "./core/ast-to-vue";
import { dataToVue as dataToVueCore } from "./core/data-to-vue";

export type DefaultRenderContext = Omit<RenderContext, "inlineElements" | "blockElements"> & {
    inlineElements?: Partial<typeof InlineElements>;
    blockElements?: Partial<typeof BlockElements>;
};

export const astToVue = (ast: AstDocument, context: DefaultRenderContext) =>
    astToVueCore(ast, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });

export const dataToVue = (data: Document, context: DefaultRenderContext) =>
    dataToVueCore(data, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });
