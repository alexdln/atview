import { type LeafletLinearDocument } from "@src/core/defs/document";

import { astToAtviewHtml, atviewHtmlToAst, type AstToAtviewHtmlContext } from "../../ast";
import { dataToAst } from "./data-to-ast";
import { astToData } from "./ast-to-data";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

const dataToAtviewHtml = (data: { pages: LeafletLinearDocument[] }, context: AstToAtviewHtmlContext) =>
    astToAtviewHtml(dataToAst(data), context);

const atviewHtmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    engine: "blocks" as const,
    ...astToData(atviewHtmlToAst(html, objectStore)),
});

export const LeafletProvider = {
    dataToAst,
    astToData,
    dataToAtviewHtml,
    atviewHtmlToData,
    formatDocument,
    processBlobs,
};
