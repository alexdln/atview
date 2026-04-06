import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstMediaNode,
    type AstOrderedListNode,
    type AstUnorderedListNode,
} from "./types";
import { type Blob } from "../defs/document";
import { cleanText, cloneNodesIntoWrapper, splitParagraphs } from "./document-text";
import { detectLanguage, LANGUAGE_CLASS_REGEX } from "../utils/code";

const SKIPPED_TAGS = new Set(["script", "style", "noscript"]);

const CONTAINER_BLOCKS = new Set([
    "div",
    "section",
    "article",
    "main",
    "aside",
    "header",
    "footer",
    "nav",
    "details",
    "summary",
    "body",
]);

const HEADING_LEVEL: Record<string, 2 | 3 | 4 | 5 | 6> = {
    h1: 2,
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
};

const INLINE_FORMAT: Partial<Record<string, AstInlineNode["type"]>> = {
    b: "bold",
    strong: "bold",
    i: "italic",
    em: "italic",
    u: "underline",
    s: "strikethrough",
    strike: "strikethrough",
    mark: "highlight",
};

export interface HtmlToAstOptions {
    domParser?: DOMParser;
    processImageBlob?: RenderContext["processImageBlob"];
}

interface RenderContext {
    processImageBlob: (src: string | Blob) => Promise<string | Blob>;
    document: Document;
}

const flowTagName = (element: HTMLElement) => element.dataset.tag || element.tagName.toLowerCase();

const textContentWithBr = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if ((node as HTMLElement).tagName.toLowerCase() === "br") return "\n";
    return Array.from(node.childNodes).map(textContentWithBr).join("");
};

const collectChildrenInline = (parent: Node, context: RenderContext): AstInlineNode[] =>
    Array.from(parent.childNodes).flatMap((child) => walkInline(child, context));

/** Non-paragraph blocks use plain text only (no bold/link structure). */
const plainInlineNodesFromElement = (element: HTMLElement): AstInlineNode[] => {
    const value = cleanText(element.textContent || "");
    return value ? [{ type: "text", value }] : [];
};

const inlineFromClonedNodes = (nodes: Node[], context: RenderContext): AstInlineNode[] => {
    if (nodes.length === 0) return [];
    return collectChildrenInline(cloneNodesIntoWrapper(context.document, nodes), context);
};

const walkInline = (node: Node, context: RenderContext): AstInlineNode[] => {
    if (node.nodeType === Node.TEXT_NODE) {
        const value = cleanText(node.textContent || "");
        return value ? [{ type: "text", value }] : [];
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const element = node as HTMLElement;
    const tag = flowTagName(element);
    if (SKIPPED_TAGS.has(tag)) return [];

    if (tag === "br") return [{ type: "text", value: "\n" }];

    const inlineType = INLINE_FORMAT[tag];
    if (inlineType) {
        const children = collectChildrenInline(element, context);
        return children.length > 0 ? [{ type: inlineType, children } as AstInlineNode] : [];
    }

    if (tag === "a") {
        const children = collectChildrenInline(element, context);
        return children.length > 0 ? [{ type: "link", uri: element.getAttribute("href") || "", children }] : [];
    }

    if (tag === "code") {
        const children = collectChildrenInline(element, context);
        return children.length > 0 ? [{ type: "inline-code", children } as AstInlineNode] : [];
    }

    return collectChildrenInline(element, context);
};

const flushPending = (pendingNodes: Node[], context: RenderContext): AstBlockNode[] => {
    if (pendingNodes.length === 0) return [];
    const snapshot = pendingNodes.splice(0, pendingNodes.length);
    return splitParagraphs(inlineFromClonedNodes(snapshot, context));
};

const paragraphBlocksFromElement = (element: HTMLElement, context: RenderContext): AstBlockNode[] =>
    splitParagraphs(collectChildrenInline(element, context));

const codeBlockFromPre = (preElement: HTMLElement): AstBlockNode => {
    const codeElement = preElement.querySelector("code");
    const text = cleanText(textContentWithBr(codeElement || preElement));
    const languageClass = codeElement?.className.match(LANGUAGE_CLASS_REGEX)?.[1];
    const language = preElement.getAttribute("data-language") || languageClass || detectLanguage(text);
    return {
        type: "code-block",
        text,
        ...(language ? { language } : {}),
    };
};

const parseSrcsetLast = (source?: string | null) => {
    if (!source) return undefined;
    const commaSeparated = source.split(",");
    const lastCandidate = commaSeparated[commaSeparated.length - 1]?.trim();
    return lastCandidate?.split(" ")[0]?.trim();
};

const mediaFromImage = async (
    imageElement: HTMLImageElement,
    figureElement: HTMLElement | null,
    context: RenderContext,
): Promise<AstMediaNode> => {
    const src =
        imageElement.getAttribute("src") ||
        parseSrcsetLast(imageElement.closest("picture")?.querySelector("source")?.getAttribute("srcset")) ||
        "";
    const alt = figureElement?.getAttribute("data-alt") || imageElement.getAttribute("alt") || undefined;
    const caption =
        figureElement?.querySelector("figcaption")?.textContent?.trim() ||
        figureElement?.getAttribute("data-caption") ||
        "";
    const text = caption || imageElement.alt || src || undefined;
    const width = figureElement?.getAttribute("data-width") || imageElement.getAttribute("width") || undefined;
    const height = figureElement?.getAttribute("data-height") || imageElement.getAttribute("height") || undefined;
    const image = await context.processImageBlob(src);
    return {
        type: "media",
        text,
        image,
        alt,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
    };
};

const parseListItem = (listItemElement: HTMLLIElement, context: RenderContext): AstListItem => {
    const childNodes = Array.from(listItemElement.childNodes);
    const inlineBuffer: Node[] = [];
    let nestedList: HTMLUListElement | HTMLOListElement | undefined;

    for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const upperTagName = (child as HTMLElement).tagName;
            if (upperTagName === "UL" || upperTagName === "OL") {
                nestedList = child as HTMLUListElement | HTMLOListElement;
                break;
            }
        }
        inlineBuffer.push(child);
    }

    const children =
        inlineBuffer.length === 0
            ? []
            : (() => {
                  const container = cloneNodesIntoWrapper(context.document, inlineBuffer);
                  const value = cleanText(container.textContent || "");
                  return value ? [{ type: "text" as const, value }] : [];
              })();

    const item: AstListItem = { children };
    if (nestedList) {
        item.sublist =
            nestedList.tagName === "UL"
                ? parseUnorderedList(nestedList as HTMLUListElement, context)
                : parseOrderedList(nestedList as HTMLOListElement, context);
    }
    return item;
};

const parseUnorderedList = (unorderedList: HTMLUListElement, context: RenderContext): AstUnorderedListNode => ({
    type: "unordered-list",
    items: Array.from(unorderedList.children)
        .filter((child): child is HTMLLIElement => child.tagName === "LI")
        .map((listItemElement) => parseListItem(listItemElement, context)),
});

const parseOrderedList = (orderedList: HTMLOListElement, context: RenderContext): AstOrderedListNode => {
    const start = orderedList.hasAttribute("start") ? Number(orderedList.getAttribute("start")) || 1 : 1;
    const items = Array.from(orderedList.children)
        .filter((child): child is HTMLLIElement => child.tagName === "LI")
        .map((listItemElement) => parseListItem(listItemElement, context));
    return {
        type: "ordered-list",
        items,
        ...(start !== 1 ? { start } : {}),
    };
};

const bskyPostFromElement = (element: HTMLElement): AstBlockNode => ({
    type: "bsky-post",
    uri: element.getAttribute("data-uri") || "",
    cid: element.getAttribute("data-cid") || "",
    text: element.textContent?.trim() || undefined,
});

const walkFlow = async (
    nodes: ChildNode[],
    context: RenderContext,
    blocks: AstBlockNode[],
    pendingNodes: Node[],
): Promise<void> => {
    const flushPendingIntoBlocks = () => {
        blocks.push(...flushPending(pendingNodes, context));
    };

    for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent) pendingNodes.push(node);
            continue;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const element = node as HTMLElement;
        const tag = flowTagName(element);

        if (SKIPPED_TAGS.has(tag)) continue;

        if (tag === "br") {
            pendingNodes.push(context.document.createTextNode("\n"));
            continue;
        }

        if (CONTAINER_BLOCKS.has(tag)) {
            await walkFlow(Array.from(element.childNodes), context, blocks, pendingNodes);
            continue;
        }

        if (tag === "p") {
            flushPendingIntoBlocks();
            blocks.push(...paragraphBlocksFromElement(element, context));
            continue;
        }

        const headingLevel = HEADING_LEVEL[tag];
        if (headingLevel) {
            flushPendingIntoBlocks();
            blocks.push({
                type: "heading",
                level: headingLevel,
                children: plainInlineNodesFromElement(element),
            });
            continue;
        }

        if (tag === "blockquote") {
            flushPendingIntoBlocks();
            blocks.push({ type: "blockquote", children: plainInlineNodesFromElement(element) });
            continue;
        }

        if (tag === "pre") {
            flushPendingIntoBlocks();
            blocks.push(codeBlockFromPre(element));
            continue;
        }

        if (tag === "ul") {
            flushPendingIntoBlocks();
            blocks.push(parseUnorderedList(element as HTMLUListElement, context));
            continue;
        }

        if (tag === "ol") {
            flushPendingIntoBlocks();
            blocks.push(parseOrderedList(element as HTMLOListElement, context));
            continue;
        }

        if (tag === "figure") {
            const imageElement = element.querySelector("img");
            if (imageElement) {
                flushPendingIntoBlocks();
                const media = await mediaFromImage(imageElement as HTMLImageElement, element, context);
                blocks.push(media);
                continue;
            }
        }

        if (tag === "img") {
            flushPendingIntoBlocks();
            const media = await mediaFromImage(element as HTMLImageElement, null, context);
            blocks.push(media);
            continue;
        }

        if (tag === "hr") {
            flushPendingIntoBlocks();
            blocks.push({ type: "horizontal-rule" });
            continue;
        }

        if (tag === "bsky-post") {
            flushPendingIntoBlocks();
            blocks.push(bskyPostFromElement(element));
            continue;
        }

        if (tag === "table" || tag === "iframe") {
            flushPendingIntoBlocks();
            continue;
        }

        pendingNodes.push(node);
    }
};

const getDomParser = (options?: HtmlToAstOptions): DOMParser => {
    if (options?.domParser) return options.domParser;
    const DomParserConstructor = globalThis.DOMParser;
    if (!DomParserConstructor) {
        throw new Error(
            'realHtmlToAst: DOMParser is not available. In Node, use jsdom: `const { JSDOM } = require("jsdom"); const p = new JSDOM().window.DOMParser; realHtmlToAst(html, store, { domParser: new p() })` or polyfill globalThis.DOMParser.',
        );
    }
    return new DomParserConstructor();
};

export const realHtmlToAst = async (html: string, options: HtmlToAstOptions = {}): Promise<AstDocument> => {
    const { processImageBlob = async (src: string | Blob) => src } = options;
    const parser = getDomParser(options);
    const htmlDocument = parser.parseFromString(html, "text/html");
    const context: RenderContext = { processImageBlob, document: htmlDocument };
    const blocks: AstBlockNode[] = [];
    const pendingNodes: Node[] = [];

    await walkFlow(Array.from(htmlDocument.body.childNodes), context, blocks, pendingNodes);
    blocks.push(...flushPending(pendingNodes, context));

    return blocks;
};
