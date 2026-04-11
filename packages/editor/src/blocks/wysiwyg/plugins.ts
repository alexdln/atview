import {
    type WysiwygPlugin,
    type FormattingPluginDefinition,
    type WysiwygSelectionSnapshot,
    type PluginFactoryOptions,
} from "./types";
import { getInlineEditableSnapshot, insertFacet, updateFacet, parseElementRecord } from "./facets";
import { isListTag, formatAsListText, LIST_PREFIXES } from "./lists";

export const FORMATTING_PLUGIN_DEFINITIONS: FormattingPluginDefinition[] = [
    { id: "h2", label: "H2", tag: "h2", block: true, htmlTag: "h2" },
    { id: "h3", label: "H3", tag: "h3", block: true, htmlTag: "h3" },
    { id: "blockquote", label: "Quote", tag: "blockquote", block: true, htmlTag: "blockquote" },
    { id: "i", label: "i", tag: "i", htmlTag: "em", hotkey: "i", htmlAliases: ["i"] },
    { id: "b", label: "b", tag: "b", htmlTag: "strong", hotkey: "b", htmlAliases: ["b"] },
    { id: "u", label: "u", tag: "u", htmlTag: "u", hotkey: "u" },
    { id: "ul", label: "UL", tag: "ul", block: true, htmlTag: "ul" },
    { id: "ol", label: "OL", tag: "ol", block: true, htmlTag: "ol" },
    { id: "code", label: "``", tag: "code", htmlTag: "code", hotkey: "e" },
];

export const FORMATTING_BY_TAG = Object.fromEntries(
    FORMATTING_PLUGIN_DEFINITIONS.map((def) => [def.tag, def]),
) as Record<string, FormattingPluginDefinition>;

export const FORMATTING_HTML_TO_TAG = Object.fromEntries(
    FORMATTING_PLUGIN_DEFINITIONS.flatMap((def) => [
        [def.htmlTag, def.tag],
        ...(def.htmlAliases || []).map((alias) => [alias, def.tag]),
    ]),
) as Record<string, string>;

const withSnapshot = (options: PluginFactoryOptions, action: (snapshot: WysiwygSelectionSnapshot) => void) => {
    const editor = options.editorRef.current;
    if (!editor) return;
    const snapshot = getInlineEditableSnapshot(editor);
    if (!snapshot) return;
    action(snapshot);
};

const createListItemEnter = (options: PluginFactoryOptions, tag: string): (() => boolean) | undefined => {
    if (!isListTag(tag)) return undefined;
    const prefix = LIST_PREFIXES[tag];

    return () => {
        const editor = options.editorRef.current;
        if (!editor) return false;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;

        const range = selection.getRangeAt(0);
        const startElement = range.startContainer.parentElement;
        if (!startElement || !editor.contains(startElement)) return false;
        if (!startElement.closest(`[data-tag="${tag}"]`)) return false;
        if (range.startContainer.nodeType !== Node.TEXT_NODE) return false;

        const textNode = range.startContainer;
        const sourceText = textNode.textContent || "";
        const cursor = range.startOffset;
        textNode.textContent = `${sourceText.substring(0, cursor)}\n${prefix}${sourceText.substring(cursor)}`;
        selection.setPosition(textNode, cursor + 1 + prefix.length);
        options.normalizeEditor();
        return true;
    };
};

const createFormattingPlugin = (
    options: PluginFactoryOptions,
    definition: FormattingPluginDefinition,
): WysiwygPlugin => ({
    id: definition.id,
    label: definition.label,
    appliedTag: definition.tag,
    block: definition.block,
    hotkey: definition.hotkey,
    execute: () =>
        withSnapshot(options, (snapshot) => {
            const text = isListTag(definition.tag) ? formatAsListText(snapshot.text, definition.tag) : snapshot.text;

            insertFacet(snapshot, {
                tag: definition.tag,
                text,
                type: definition.block ? "block" : "inline",
            });
            options.normalizeEditor();
        }),
    onEnter: createListItemEnter(options, definition.tag),
});

const createLinkFacetSubmit =
    (options: PluginFactoryOptions, snapshot: WysiwygSelectionSnapshot) => (uri: string, text: string) => {
        insertFacet(snapshot, {
            tag: "link",
            text,
            type: "inline",
            record: { uri },
        });
        options.normalizeEditor();
    };

const createPostFacetSubmit =
    (options: PluginFactoryOptions, snapshot: WysiwygSelectionSnapshot) =>
    (postRef: { uri: string; cid: string }, text: string) => {
        insertFacet(snapshot, {
            tag: "bsky-post",
            text,
            type: "block",
            record: { uri: postRef.uri, cid: postRef.cid },
        });
        options.normalizeEditor();
    };

const createMediaSubmit =
    (options: PluginFactoryOptions, snapshot: WysiwygSelectionSnapshot) =>
    async (file: File | null, text: string, altText: string, caption: string) => {
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        const image = new Image();
        image.src = previewUrl;
        await new Promise<void>((resolve) => {
            image.onload = () => resolve();
        });

        options.objectStoreRef.current.set(previewUrl, file);
        insertFacet(snapshot, {
            tag: "media",
            text,
            type: "block",
            record: {
                alt: altText,
                caption,
                image: previewUrl,
                width: image.width,
                height: image.height,
            },
            styles: {
                "--preview-url": `url(${previewUrl})`,
                "--aspect-ratio": `${Math.round((image.width / image.height) * 100) / 100}`,
            },
        });
        options.normalizeEditor();
    };

const createCodeBlockSubmit =
    (options: PluginFactoryOptions, snapshot: WysiwygSelectionSnapshot) =>
    (text: string, filename: string, language: string) => {
        insertFacet(snapshot, {
            tag: "code-block",
            text,
            type: "block",
            record: { filename, language },
        });
        options.normalizeEditor();
    };

const createMathBlockSubmit = (options: PluginFactoryOptions, snapshot: WysiwygSelectionSnapshot) => (text: string) => {
    insertFacet(snapshot, {
        tag: "math",
        text,
        type: "block",
    });
    options.normalizeEditor();
};

const createDialogPlugin = (
    options: PluginFactoryOptions,
    config: {
        id: string;
        label: string;
        appliedTag: string;
        block?: boolean;
        openDialog: (snapshot: WysiwygSelectionSnapshot) => void;
    },
): WysiwygPlugin => ({
    id: config.id,
    label: config.label,
    appliedTag: config.appliedTag,
    block: config.block,
    execute: () => withSnapshot(options, config.openDialog),
});

export const createWysiwygPlugins = (options: PluginFactoryOptions): WysiwygPlugin[] => [
    ...FORMATTING_PLUGIN_DEFINITIONS.map((def) => createFormattingPlugin(options, def)),

    createDialogPlugin(options, {
        id: "link",
        label: "Link",
        appliedTag: "link",
        openDialog: (snapshot) =>
            options.setLinkDialog({
                open: true,
                data: {
                    uri: "",
                    text: snapshot.text,
                    onSubmit: createLinkFacetSubmit(options, snapshot),
                },
            }),
    }),

    createDialogPlugin(options, {
        id: "bsky-post",
        label: "Bluesky Post",
        appliedTag: "bsky-post",
        block: true,
        openDialog: (snapshot) =>
            options.setPostDialog({
                open: true,
                data: {
                    uri: "",
                    cid: "",
                    text: snapshot.text,
                    onSubmit: createPostFacetSubmit(options, snapshot),
                },
            }),
    }),

    createDialogPlugin(options, {
        id: "media",
        label: "Media",
        appliedTag: "media",
        block: true,
        openDialog: (snapshot) =>
            options.setMediaDialog({
                open: true,
                data: {
                    file: null,
                    text: snapshot.text,
                    altText: "",
                    caption: "",
                    onSubmit: createMediaSubmit(options, snapshot),
                },
            }),
    }),

    createDialogPlugin(options, {
        id: "codeBlock",
        label: "Code Block",
        appliedTag: "code-block",
        block: true,
        openDialog: (snapshot) =>
            options.setCodeDialog({
                open: true,
                data: {
                    text: snapshot.text,
                    filename: "",
                    language: "",
                    onSubmit: createCodeBlockSubmit(options, snapshot),
                },
            }),
    }),

    createDialogPlugin(options, {
        id: "mathBlock",
        label: "Math Block",
        appliedTag: "math",
        block: true,
        openDialog: (snapshot) =>
            options.setMathDialog({
                open: true,
                data: {
                    text: snapshot.text,
                    onSubmit: createMathBlockSubmit(options, snapshot),
                },
            }),
    }),
];

const createLinkFacetEdit = (options: PluginFactoryOptions, element: HTMLElement) => (uri: string, text: string) => {
    updateFacet(element as HTMLSpanElement, {
        tag: "link",
        text,
        type: "inline",
        record: { uri },
    });
    options.normalizeEditor();
};

const createPostFacetEdit =
    (options: PluginFactoryOptions, element: HTMLElement) => (postRef: { uri: string; cid: string }, text: string) => {
        updateFacet(element as HTMLSpanElement, {
            tag: "bsky-post",
            text,
            type: "block",
            record: { uri: postRef.uri, cid: postRef.cid },
        });
        options.normalizeEditor();
    };

const createMediaEdit =
    (options: PluginFactoryOptions, element: HTMLElement) =>
    async (file: File | null, text: string, altText: string, caption: string) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            const image = new Image();
            image.src = previewUrl;
            await new Promise<void>((resolve) => {
                image.onload = () => resolve();
            });

            options.objectStoreRef.current.set(previewUrl, file);
            updateFacet(element as HTMLSpanElement, {
                tag: "media",
                text,
                type: "block",
                record: { alt: altText, caption, media: previewUrl, width: image.width, height: image.height },
                styles: {
                    "--preview-url": `url(${previewUrl})`,
                    "--aspect-ratio": `${Math.round((image.width / image.height) * 100) / 100}`,
                },
            });
        } else {
            const existing = parseElementRecord(element) || {};
            updateFacet(element as HTMLSpanElement, {
                tag: "media",
                text,
                type: "block",
                record: { ...existing, alt: altText, caption },
            });
        }
        options.normalizeEditor();
    };

const createCodeBlockEdit =
    (options: PluginFactoryOptions, element: HTMLElement) => (text: string, filename: string, language: string) => {
        updateFacet(element as HTMLSpanElement, {
            tag: "code-block",
            text,
            type: "block",
            record: { filename, language },
        });
        options.normalizeEditor();
    };

const createMathBlockEdit = (options: PluginFactoryOptions, element: HTMLElement) => (text: string) => {
    updateFacet(element as HTMLSpanElement, {
        tag: "math",
        text,
        type: "block",
    });
    options.normalizeEditor();
};

export const createBlockEditHandlers = (
    options: PluginFactoryOptions,
): Record<string, (element: HTMLElement) => void> => ({
    link: (element) => {
        const record = parseElementRecord(element);
        options.setLinkDialog({
            open: true,
            data: {
                uri: String(record?.uri || ""),
                text: element.textContent || "",
                onSubmit: createLinkFacetEdit(options, element),
            },
        });
    },
    "bsky-post": (element) => {
        const record = parseElementRecord(element);
        options.setPostDialog({
            open: true,
            data: {
                uri: String(record?.uri || ""),
                cid: String(record?.cid || ""),
                text: element.textContent || "",
                onSubmit: createPostFacetEdit(options, element),
            },
        });
    },
    media: (element) => {
        const record = parseElementRecord(element);
        options.setMediaDialog({
            open: true,
            data: {
                file: null,
                text: element.textContent || "",
                altText: String(record?.alt || ""),
                caption: String(record?.caption || ""),
                onSubmit: createMediaEdit(options, element),
            },
        });
    },
    "code-block": (element) => {
        const record = parseElementRecord(element);
        options.setCodeDialog({
            open: true,
            data: {
                text: element.textContent || "",
                filename: String(record?.filename || ""),
                language: String(record?.language || ""),
                onSubmit: createCodeBlockEdit(options, element),
            },
        });
    },
    math: (element) => {
        options.setMathDialog({
            open: true,
            data: {
                text: element.textContent || "",
                onSubmit: createMathBlockEdit(options, element),
            },
        });
    },
});
