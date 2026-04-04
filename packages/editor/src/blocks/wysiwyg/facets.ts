import { type PseudoFacetConfig, type WysiwygSelectionSnapshot } from "./types";

export const createPseudoFacet = (doc: Document, config: PseudoFacetConfig): HTMLSpanElement => {
    const element = doc.createElement("span");
    element.dataset.tag = config.tag;
    element.dataset.type = config.type;
    element.textContent = config.text;

    if (config.record) {
        element.dataset.record = JSON.stringify(config.record);
    }

    if (config.styles) {
        for (const [key, value] of Object.entries(config.styles)) {
            element.style.setProperty(key, value);
        }
    }

    return element;
};

export const restoreSelection = (snapshot: WysiwygSelectionSnapshot) => {
    snapshot.selection.removeAllRanges();
    snapshot.selection.addRange(snapshot.range);
};

export const readSnapshot = (editor: HTMLDivElement): WysiwygSelectionSnapshot | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const element = range.startContainer.parentElement;
    if (!element || !editor.contains(element)) return null;

    return {
        selection,
        range: range.cloneRange(),
        text: range.startContainer.textContent?.substring(range.startOffset, range.endOffset) || "",
    };
};

export const getInlineEditableSnapshot = (editor: HTMLDivElement): WysiwygSelectionSnapshot | null => {
    const snapshot = readSnapshot(editor);
    if (!snapshot) return null;

    const { selection, range } = snapshot;
    if (selection.isCollapsed || range.startContainer !== range.endContainer) {
        restoreSelection(snapshot);
        return null;
    }

    if (range.startContainer.parentElement?.closest("[data-tag]") || range.startContainer.hasChildNodes()) {
        restoreSelection(snapshot);
        return null;
    }

    return snapshot;
};

export const insertFacet = (snapshot: WysiwygSelectionSnapshot, config: PseudoFacetConfig): HTMLSpanElement => {
    const element = createPseudoFacet(document, config);

    snapshot.range.deleteContents();
    snapshot.range.insertNode(element);
    snapshot.range.setStartAfter(element);
    snapshot.range.collapse(true);
    restoreSelection(snapshot);

    return element;
};

export const updateFacet = (element: HTMLSpanElement, config: Partial<PseudoFacetConfig>) => {
    if (config.text !== undefined) element.textContent = config.text;
    if (config.tag) element.dataset.tag = config.tag;
    if (config.type) element.dataset.type = config.type;
    if (config.record) {
        element.dataset.record = JSON.stringify(config.record);
    }
    if (config.styles) {
        for (const [key, value] of Object.entries(config.styles)) {
            element.style.setProperty(key, value);
        }
    }
};

export const parseElementRecord = (element: HTMLElement): Record<string, unknown> | undefined => {
    const raw = element.dataset.record;
    if (!raw) return undefined;
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
};
