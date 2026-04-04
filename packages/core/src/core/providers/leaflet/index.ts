import { type LeafletLinearDocument } from "@src/core/defs/document";

import { astToHtml, htmlToAst, type AstToHtmlContext } from "../../ast";
import { dataToAst } from "./data-to-ast";
import { astToData } from "./ast-to-data";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

const dataToHtml = (data: { pages: LeafletLinearDocument[] }, context: AstToHtmlContext) =>
    astToHtml(dataToAst(data), context);

const htmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    engine: "blocks" as const,
    ...astToData(htmlToAst(html, objectStore)),
});

export const LeafletProvider = {
    dataToAst,
    astToData,
    // dataToJsx,
    dataToHtml,
    htmlToData,
    formatDocument,
    processBlobs,
};
