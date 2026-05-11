import { type Document } from "@atview/core";
import { type DefaultRenderContext } from "@atview/react/default";
import { dataToJsx as dataToJsxCore } from "@atview/react";

import { InlineElements, BlockElements } from "./components";

export const dataToJsx = (data: Document, context: DefaultRenderContext) =>
    dataToJsxCore(data, {
        ...context,
        inlineElements: { ...InlineElements, ...context.inlineElements },
        blockElements: { ...BlockElements, ...context.blockElements },
    });
