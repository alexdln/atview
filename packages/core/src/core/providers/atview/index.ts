import { type Facet } from "@src/core/defs/document";

import { astToAtviewHtml, atviewHtmlToAst, type AstToAtviewHtmlContext } from "../../ast";
import { dataToAst } from "./data-to-ast";
import { astToData } from "./ast-to-data";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

const dataToHtml = (data: { textContent: string; facets?: Facet[] }, context: AstToAtviewHtmlContext) =>
    astToAtviewHtml(dataToAst(data), context);

const htmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    engine: "facets" as const,
    ...astToData(atviewHtmlToAst(html, objectStore)),
});

export const AtviewProvider = {
    dataToAst,
    astToData,
    dataToHtml,
    htmlToData,
    formatDocument,
    processBlobs,
};
