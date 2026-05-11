import { type AstDocument } from "@atview/core";
import { type DefaultRenderContext } from "@atview/react/default";
import { astToJsx as astToJsxCore } from "@atview/react";

import { InlineElements, BlockElements } from "./components";

export const astToJsx = (ast: AstDocument, context: DefaultRenderContext) =>
    astToJsxCore(ast, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });
