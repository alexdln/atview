import { astToAtviewHtml, atviewHtmlToAst, type AstToAtviewHtmlContext } from "../../ast";

import { astToData } from "./ast-to-data";
import { dataToAst } from "./data-to-ast";
import { formatDocument } from "./format-document";

const dataToAtviewHtml = (data: { textContent: string }, context: AstToAtviewHtmlContext) =>
    astToAtviewHtml(dataToAst(data), context);

const atviewHtmlToData = (html: HTMLElement, objectStore: Map<string, File>) => ({
    ...astToData(atviewHtmlToAst(html, objectStore)),
});

export const SiteStandardProvider = {
    dataToAst,
    astToData,
    dataToAtviewHtml,
    atviewHtmlToData,
    formatDocument,
};
