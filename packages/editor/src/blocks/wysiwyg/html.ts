import {
    astToAtviewHtml,
    astToPlainText,
    astToRealHtml,
    atviewHtmlToAst,
    realHtmlToAst,
    type AstToAtviewHtmlContext,
    type HtmlToAstOptions,
} from "@atview/core";

export interface HtmlImportOptions extends AstToAtviewHtmlContext {
    processImageBlob?: HtmlToAstOptions["processImageBlob"];
}

const parseSource = (source?: string | null) => {
    if (!source) return undefined;
    const options = source.split(",");
    const lastOption = options?.[options.length - 1].trim();
    const uri = lastOption?.split(" ")[0].trim();
    return uri;
};

export const isSelectionInsideEditor = (editor: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const startEl =
        range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as HTMLElement)
            : range.startContainer.parentElement;
    const endEl =
        range.endContainer.nodeType === Node.ELEMENT_NODE
            ? (range.endContainer as HTMLElement)
            : range.endContainer.parentElement;

    return Boolean(startEl && endEl && editor.contains(startEl) && editor.contains(endEl));
};

export const buildHtmlFromSelection = (editor: HTMLDivElement, objectStore: Map<string, File>, authorDid?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !isSelectionInsideEditor(editor)) return null;

    const range = selection.getRangeAt(0);
    const wrapper = document.createElement("div");
    wrapper.appendChild(range.cloneContents());

    const ast = atviewHtmlToAst(wrapper, objectStore);
    const html = astToRealHtml(ast);
    return {
        html,
        text: astToPlainText(ast, { authorDid: authorDid }),
    };
};

export const buildPseudoFragmentFromHtml = async (
    html: string,
    targetDoc: Document,
    options: HtmlImportOptions = {},
): Promise<DocumentFragment> => {
    const { authorDid, processImageBlob } = options;
    const ast = await realHtmlToAst(html, { processImageBlob });
    const pseudoHtml = astToAtviewHtml(ast, { authorDid });
    const wrapper = targetDoc.createElement("div");
    wrapper.innerHTML = pseudoHtml;
    const fragment = targetDoc.createDocumentFragment();
    while (wrapper.firstChild) {
        fragment.appendChild(wrapper.firstChild);
    }
    return fragment;
};

export const extractArticleHtml = (pageHtml: string): string => {
    const doc = new DOMParser().parseFromString(pageHtml, "text/html");

    doc.querySelectorAll("h1, .speechify-ignore, script, style, header, footer").forEach((el) => el.remove());
    const article = doc.querySelector("article");
    if (article) {
        return article.innerHTML;
    }

    return doc.body.innerHTML;
};

export const insertHtmlToEditor = async (
    html: string,
    editor: HTMLDivElement,
    normalizeEditor: () => void,
    options: HtmlImportOptions = {},
) => {
    const fragment = await buildPseudoFragmentFromHtml(html, document, options);
    const nodes = Array.from(fragment.childNodes);
    if (!nodes.length) return;

    editor.textContent = "";
    editor.appendChild(fragment);
    normalizeEditor();
};

export const processImportImages = async (
    articleHtml: string,
    objectStore: Map<string, File>,
    options: { origin?: string } = {},
): Promise<string> => {
    const { origin } = options;
    const doc = new DOMParser().parseFromString(articleHtml, "text/html");
    const images = doc.querySelectorAll("img");

    await Promise.all(
        Array.from(images).map(async (img) => {
            const container = img.closest("figure, picture");

            const src =
                img.getAttribute("src") || parseSource(container?.querySelector("source")?.getAttribute("srcset"));
            if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

            let fetchUrl = src;
            if (src.startsWith("//")) fetchUrl = `https:${src}`;
            if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://") && !origin) return;
            if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://")) fetchUrl = `${origin}${src}`;

            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) return;

                const blob = await response.blob();
                const filename = new URL(fetchUrl).pathname.split("/").pop() || "image";
                const file = new File([blob], filename, { type: blob.type });
                const previewUrl = URL.createObjectURL(file);

                const loaded = new Image();
                loaded.src = previewUrl;
                await new Promise<void>((resolve) => {
                    loaded.onload = () => resolve();
                    loaded.onerror = () => resolve();
                });

                objectStore.set(previewUrl, file);
                img.src = previewUrl;
                if (loaded.naturalWidth && loaded.naturalHeight) {
                    img.setAttribute("width", String(loaded.naturalWidth));
                    img.setAttribute("height", String(loaded.naturalHeight));
                }
            } catch {
                // Keep original URL if fetch fails
            }
        }),
    );

    return doc.body.innerHTML;
};
