import { type PcktBlock } from "@src/core/defs/document";
import { astToAtviewHtml, atviewHtmlToAst, type AstToAtviewHtmlContext } from "../../ast";

import { astToData } from "./ast-to-data";
import { dataToAst } from "./data-to-ast";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

const dataToAtviewHtml = (data: { items: PcktBlock[] }, context: AstToAtviewHtmlContext) =>
    astToAtviewHtml(dataToAst(data), context);

const atviewHtmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    ...astToData(atviewHtmlToAst(html, objectStore)),
});

export const PcktProvider = {
    dataToAst,
    astToData,
    dataToAtviewHtml,
    atviewHtmlToData,
    formatDocument,
    processBlobs,
};
