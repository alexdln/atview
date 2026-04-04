export const checkRangeFormatting = (selection: Selection, appliedTags: Record<string, string>) => {
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range) return;

    const isBlock = range.startContainer.parentElement?.closest(`[data-type="block"]`);
    const isFormatted = range.startContainer.parentElement?.closest(`[data-tag]`);

    return {
        isFormatted,
        isInvalid:
            selection.isCollapsed ||
            range.startContainer !== range.endContainer ||
            range.startContainer.hasChildNodes(),
        isCollapsed: selection.isCollapsed,
        isBlock,
        applied: Object.fromEntries(
            Object.entries(appliedTags).map(([key, tag]) => [
                key,
                Boolean(range.startContainer.parentElement?.closest(`[data-tag="${tag}"]`)),
            ]),
        ) as Record<string, boolean>,
    };
};

const defaultOptions = {
    validate: (node: HTMLElement) => node.hasAttribute("data-tag"),
};
export const unwrapInvalidRecursive = (node?: HTMLElement, options: Partial<typeof defaultOptions> = {}) => {
    if (!node || !(node instanceof HTMLElement)) return;

    const { validate } = { ...defaultOptions, ...options };
    if (node.children) {
        Array.from(node.children).forEach((child) => unwrapInvalidRecursive(child as HTMLElement));
    }

    if (!validate(node)) {
        const parent = node.parentNode;
        if (!parent) return;

        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
    }
};

export const countChar = (str: string, char: string) => {
    let count = 0;
    for (const c of str) {
        if (c === char) count++;
    }
    return count;
};

export const normalizeZeroWidthSpaces = (text: ChildNode | null, selection: Selection | null) => {
    if (!text) return;

    const origContent = text.textContent || "";
    const newTextContent = origContent.replaceAll("\u200B", "");
    const selectionOffset = selection?.anchorOffset || 0;

    if (origContent !== newTextContent) {
        text.textContent = newTextContent;
        if (selection?.anchorNode === text) {
            const offsetShift = countChar(origContent.substring(0, selectionOffset), "\u200B");
            selection.setPosition(text, selectionOffset - offsetShift);
        }
    }

    return text;
};

export const fixTextNodes = (element: HTMLElement) => {
    const nodes = element.childNodes;
    let prevNode: ChildNode | null = null;
    const lastIndex = nodes.length - 1;
    const selection = window.getSelection();

    for (let i = lastIndex; i >= 0; i--) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE && prevNode?.nodeType === Node.TEXT_NODE) {
            const nodeTextContent = node.textContent || "";
            const mergedLength = nodeTextContent?.length || 0;
            node.textContent = nodeTextContent + (prevNode.textContent || "");
            if (selection?.anchorNode === prevNode) {
                selection.setPosition(node, mergedLength + selection.anchorOffset);
            }
            prevNode.parentElement?.removeChild(prevNode);
        } else if (node.nodeType !== Node.TEXT_NODE && prevNode && prevNode.nodeType !== Node.TEXT_NODE) {
            prevNode.parentElement?.insertBefore(document.createTextNode("\u200B"), prevNode);
        }
        if (node.nodeType === Node.TEXT_NODE) {
            normalizeZeroWidthSpaces(node, selection);
        } else if (node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
            normalizeZeroWidthSpaces(node.firstChild, selection);
        }
        prevNode = node;
    }

    if (element.lastChild?.nodeType !== Node.TEXT_NODE) {
        element.appendChild(document.createTextNode("\u200B"));
    } else if (element.lastChild && !element.lastChild.textContent) {
        element.lastChild.textContent = "\u200B";
    }
};

export const resetSelectionFormatting = (editor: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const startElement =
        range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as HTMLElement)
            : range.startContainer.parentElement;
    const endElement =
        range.endContainer.nodeType === Node.ELEMENT_NODE
            ? (range.endContainer as HTMLElement)
            : range.endContainer.parentElement;
    const isOutsideEditor =
        !startElement || !endElement || !editor.contains(startElement) || !editor.contains(endElement);
    if (isOutsideEditor) return false;

    const selectedFormattedNodes = Array.from(editor.querySelectorAll<HTMLElement>("[data-tag]")).filter((node) => {
        try {
            return range.intersectsNode(node);
        } catch {
            return false;
        }
    });
    if (!selectedFormattedNodes.length) return false;

    selectedFormattedNodes.forEach((node) => unwrapInvalidRecursive(node, { validate: () => false }));
    fixTextNodes(editor);
    return true;
};
