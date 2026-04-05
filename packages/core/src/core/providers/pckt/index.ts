import { type PcktBlock } from "@src/core/defs/document";
import { astToAtviewHtml, atviewHtmlToAst, type AstToAtviewHtmlContext } from "../../ast";

import { astToData } from "./ast-to-data";
import { dataToAst } from "./data-to-ast";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

const dataToHtml = (data: { items: PcktBlock[] }, context: AstToAtviewHtmlContext) =>
    astToAtviewHtml(dataToAst(data.items), context);

const htmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    engine: "pckt_blocks" as const,
    ...astToData(atviewHtmlToAst(html, objectStore)),
});

export const PcktProvider = {
    dataToAst,
    astToData,
    dataToHtml,
    htmlToData,
    formatDocument,
    processBlobs,
};
