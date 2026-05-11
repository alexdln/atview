import { type AstDocument, type Document } from "@atview/core";
import { InlineElements, BlockElements } from "./core/components";
import { astToJsx as astToJsxCore, type RenderContext } from "./core/ast-to-jsx";
import { dataToJsx as dataToJsxCore } from "./core/data-to-jsx";

export type DefaultRenderContext = Omit<RenderContext, "inlineElements" | "blockElements"> & {
    inlineElements?: Partial<typeof InlineElements>;
    blockElements?: Partial<typeof BlockElements>;
};

export const astToJsx = (ast: AstDocument, context: DefaultRenderContext) =>
    astToJsxCore(ast, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });

export const dataToJsx = (data: Document, context: DefaultRenderContext) =>
    dataToJsxCore(data, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });
