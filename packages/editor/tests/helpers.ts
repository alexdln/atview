import { type AtviewFacet } from "@atview/core";

import { atviewHtmlToAst } from "../src/atview-html";

export const sortFacets = <T extends AtviewFacet>(facets: T[]): T[] =>
    [...facets].sort((first, second) =>
        first.index.byteStart !== second.index.byteStart
            ? first.index.byteStart - second.index.byteStart
            : first.index.byteEnd - second.index.byteEnd,
    );

export const normalizeAtviewData = (data: { textContent: string; facets?: AtviewFacet[] }) => ({
    textContent: data.textContent,
    facets: sortFacets(data.facets ?? []),
});

export const parseAtviewHtmlToAst = (html: string, objectStore = new Map<string, File>()) => {
    const root = document.createElement("div");
    root.innerHTML = html;
    return atviewHtmlToAst(root, objectStore);
};
