"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDialogReducer } from "contection-top-layer";

import {
    EditorLinkDialogProvider,
    EditorPostDialogProvider,
    EditorMediaDialogProvider,
    EditorCodeDialogProvider,
    EditorImportDialogProvider,
} from "../../stores/top-layer/store";
import { createWysiwygPlugins, createBlockEditHandlers } from "./plugins";
import {
    buildHtmlFromSelection,
    buildPseudoFragmentFromHtml,
    isSelectionInsideEditor,
    extractArticleHtml,
    insertHtmlToEditor,
    processImportImages,
} from "./html";
import { unwrapInvalidRecursive, fixTextNodes, checkRangeFormatting, resetSelectionFormatting } from "./utils";
import { AtviewProvider, ENGINES, LeafletProvider, PcktProvider } from "@atview/core";

import "./wysiwyg.scss";

export type WysiwygEngine = keyof typeof ENGINES;
export type WysiwygData<Engine extends WysiwygEngine = WysiwygEngine> = Engine extends "leaflet_blocks"
    ? ReturnType<typeof LeafletProvider.atviewHtmlToData> & { engine: "leaflet_blocks" }
    : Engine extends "leaflet_blocks_old"
      ? ReturnType<typeof LeafletProvider.atviewHtmlToData> & { engine: "leaflet_blocks_old" }
      : Engine extends "pckt_blocks"
        ? ReturnType<typeof PcktProvider.atviewHtmlToData> & { engine: "pckt_blocks" }
        : ReturnType<typeof AtviewProvider.atviewHtmlToData> & { engine: "atview_facets" };

export type EditorRef<Engine extends WysiwygEngine = WysiwygEngine> = {
    getData: () => WysiwygData<Engine>;
    getValue: () => string;
    node: HTMLDivElement;
};

export interface WysiwygProps<Engine extends WysiwygEngine = WysiwygEngine> {
    editorRef?: React.RefObject<EditorRef<Engine> | null>;
    onPreviewUpdate?: (data: WysiwygData<Engine>) => void;
    className?: string;
    defaultValue?: string;
    objectStore?: Map<string, File>;
    engine?: Engine;
}

export const Wysiwyg = <Engine extends WysiwygEngine>({
    editorRef,
    onPreviewUpdate,
    className,
    defaultValue,
    objectStore,
    engine = "atview_facets" as Engine,
}: WysiwygProps<Engine>) => {
    const [, setLinkDialog] = useDialogReducer(EditorLinkDialogProvider);
    const [, setPostDialog] = useDialogReducer(EditorPostDialogProvider);
    const [, setMediaDialog] = useDialogReducer(EditorMediaDialogProvider);
    const [, setCodeDialog] = useDialogReducer(EditorCodeDialogProvider);
    const [, setImportDialog] = useDialogReducer(EditorImportDialogProvider);

    const objectStoreRef = useRef(objectStore || new Map<string, File>());
    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const wysiwygRef = useRef<HTMLDivElement>(null);

    const atviewHtmlToData = useMemo(() => {
        if (engine === "pckt_blocks") {
            return PcktProvider.atviewHtmlToData;
        }
        if (engine === "leaflet_blocks" || engine === "leaflet_blocks_old") {
            return LeafletProvider.atviewHtmlToData;
        }
        return AtviewProvider.atviewHtmlToData;
    }, [engine]);

    const normalizeEditor = useCallback(() => {
        if (!wysiwygRef.current) return;
        wysiwygRef.current.childNodes.forEach((child) => unwrapInvalidRecursive(child as HTMLElement));
        fixTextNodes(wysiwygRef.current);
    }, []);

    const plugins = useMemo(
        () =>
            createWysiwygPlugins({
                editorRef: wysiwygRef,
                objectStoreRef,
                normalizeEditor,
                setLinkDialog,
                setPostDialog,
                setMediaDialog,
                setCodeDialog,
                setImportDialog,
            }),
        [normalizeEditor, setCodeDialog, setImportDialog, setLinkDialog, setMediaDialog, setPostDialog],
    );

    const editHandlers = useMemo(
        () =>
            createBlockEditHandlers({
                editorRef: wysiwygRef,
                objectStoreRef,
                normalizeEditor,
                setLinkDialog,
                setPostDialog,
                setMediaDialog,
                setCodeDialog,
                setImportDialog,
            }),
        [normalizeEditor, setCodeDialog, setImportDialog, setLinkDialog, setMediaDialog, setPostDialog],
    );

    const pluginAppliedTags = useMemo(
        () => Object.fromEntries(plugins.map((p) => [p.id, p.appliedTag])) as Record<string, string>,
        [plugins],
    );

    const pluginsByHotkey = useMemo(() => {
        const entries = plugins.filter((p) => p.hotkey).map((p) => [p.hotkey!.toLowerCase(), p] as const);
        return new Map(entries);
    }, [plugins]);

    const setControlRef = useCallback(
        (id: string) => (el: HTMLButtonElement | null) => {
            controlsRefs.current[id] = el;
        },
        [],
    );

    const pasteHandler = useCallback(
        async (e: React.ClipboardEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (!wysiwygRef.current) return;

            const html = e.clipboardData.getData("text/html");
            if (html) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0 || !isSelectionInsideEditor(wysiwygRef.current)) return;

                const range = selection.getRangeAt(0);
                const processedHtml = await processImportImages(html, objectStoreRef.current, {
                    origin: window.location.origin,
                });
                const fragment = await buildPseudoFragmentFromHtml(processedHtml, document);
                const nodes = Array.from(fragment.childNodes);
                if (!nodes.length) return;

                range.deleteContents();
                range.insertNode(fragment);
                range.setStartAfter(nodes[nodes.length - 1]);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                normalizeEditor();
                return;
            }

            const pastedText = e.clipboardData.getData("text/plain");
            if (!pastedText) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            const pre = range.startContainer.textContent?.substring(0, range.startOffset) || "";
            const post = range.startContainer.textContent?.substring(range.startOffset) || "";
            range.startContainer.textContent = pre + pastedText + post;
            selection.setPosition(range.startContainer, pre.length + pastedText.length);
            normalizeEditor();
        },
        [normalizeEditor],
    );

    const copyHandler = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (!wysiwygRef.current) return;
        if (!isSelectionInsideEditor(wysiwygRef.current)) return;

        const payload = buildHtmlFromSelection(wysiwygRef.current, objectStoreRef.current);
        if (!payload) return;

        e.preventDefault();
        await window.navigator.clipboard.write([
            new ClipboardItem({
                "text/html": new Blob([payload.html], { type: "text/html" }),
                "text/plain": new Blob([payload.text], { type: "text/plain" }),
            }),
        ]);
    }, []);

    const updateControlStates = useCallback(() => {
        const selection = window.getSelection();
        const element =
            selection && selection.rangeCount > 0
                ? (selection.getRangeAt(0).startContainer.parentElement as HTMLElement)
                : null;
        const isFocusedOutside = !element || !wysiwygRef.current || !wysiwygRef.current.contains(element);

        const formatting = selection ? checkRangeFormatting(selection, pluginAppliedTags) : null;
        if (!formatting || formatting.isInvalid || formatting.isFormatted || isFocusedOutside) {
            for (const control of Object.values(controlsRefs.current)) {
                if (!control) continue;
                control.disabled = true;
                control.classList.remove("_active");
            }
            return;
        }

        for (const plugin of plugins) {
            const control = controlsRefs.current[plugin.id];
            if (!control) continue;
            if (formatting.applied[plugin.id]) {
                control.classList.add("_active");
                control.disabled = true;
            } else {
                control.classList.remove("_active");
                control.disabled = false;
            }
        }
    }, [pluginAppliedTags, plugins]);

    const keyDownHandler = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!e.ctrlKey) return;
            const plugin = pluginsByHotkey.get(e.key.toLowerCase());
            if (!plugin) return;
            e.preventDefault();
            plugin.execute();
        },
        [pluginsByHotkey],
    );

    const dblClickHandler = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = (e.target as HTMLElement).closest("[data-tag]") as HTMLElement | null;
            if (!target || !wysiwygRef.current?.contains(target)) return;

            const tag = target.dataset.tag;
            if (!tag || !editHandlers[tag]) return;

            e.preventDefault();
            editHandlers[tag](target);
        },
        [editHandlers],
    );

    const importHandler = useCallback(() => {
        setImportDialog({
            open: true,
            data: {
                url: "",
                onSubmit: async (url: string) => {
                    const res = await fetch("/api/fetch-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url }),
                    });

                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error || `Request failed (${res.status})`);
                    }

                    const { html } = await res.json();
                    if (!html || !wysiwygRef.current) {
                        throw new Error("No content received");
                    }
                    const origin = new URL(url).origin;

                    const articleHtml = extractArticleHtml(html);
                    const processedHtml = await processImportImages(articleHtml, objectStoreRef.current, { origin });
                    await insertHtmlToEditor(processedHtml, wysiwygRef.current, normalizeEditor);
                },
            },
        });
    }, [normalizeEditor, setImportDialog]);

    const submitHandler = useCallback(() => {
        if (!wysiwygRef.current || !onPreviewUpdate) return;
        const data = atviewHtmlToData(wysiwygRef.current, objectStoreRef.current);
        onPreviewUpdate({ ...data, engine } as WysiwygData<Engine>);
    }, [onPreviewUpdate, atviewHtmlToData, engine]);

    const enterHandler = useCallback(
        (e: KeyboardEvent) => {
            const isInDialog = e.target instanceof HTMLElement && e.target.closest("dialog");

            if (e.key !== "Enter" || e.shiftKey || isInDialog) return;
            e.preventDefault();
            const handled = plugins.some((p) => p.onEnter?.());
            if (!handled) submitHandler();
        },
        [plugins, submitHandler],
    );

    useEffect(() => {
        updateControlStates();
        document.addEventListener("selectionchange", updateControlStates);
        document.addEventListener("keydown", enterHandler);
        return () => {
            document.removeEventListener("selectionchange", updateControlStates);
            document.removeEventListener("keydown", enterHandler);
        };
    }, [enterHandler, updateControlStates]);

    useEffect(() => {
        if (editorRef) {
            editorRef.current = {
                getData: () => {
                    const data = atviewHtmlToData(wysiwygRef.current!, objectStoreRef.current);
                    return { ...data, engine } as WysiwygData<Engine>;
                },
                getValue: () => wysiwygRef.current!.innerHTML,
                node: wysiwygRef.current!,
            };
        }
    }, [editorRef, atviewHtmlToData]);

    useEffect(() => {
        if (objectStore) return;

        return () => {
            Object.keys(objectStoreRef.current).forEach((key) => {
                URL.revokeObjectURL(key);
            });
        };
    }, [objectStore]);

    useEffect(() => {
        if (defaultValue) normalizeEditor();
    }, [defaultValue, normalizeEditor]);

    return (
        <div className={className}>
            {useMemo(
                () => (
                    <div
                        className="editor-wysiwyg"
                        contentEditable
                        suppressContentEditableWarning
                        onPaste={pasteHandler}
                        onCopy={copyHandler}
                        onClick={dblClickHandler}
                        ref={wysiwygRef}
                        onKeyDown={keyDownHandler}
                        onInput={normalizeEditor}
                        dangerouslySetInnerHTML={{ __html: defaultValue || "Hello, world!" }}
                    />
                ),
                [defaultValue],
            )}
            <div className="editor-wysiwyg-buttons">
                {plugins.map((plugin) => (
                    <button
                        key={plugin.id}
                        type="button"
                        className={`control control-${plugin.id} editor-wysiwyg-button`}
                        ref={setControlRef(plugin.id)}
                        onClick={plugin.execute}
                    >
                        {plugin.label}
                    </button>
                ))}
                <button
                    type="button"
                    className="control editor-wysiwyg-button"
                    onClick={() => wysiwygRef.current && resetSelectionFormatting(wysiwygRef.current)}
                >
                    Reset
                </button>
                <button
                    type="button"
                    className="control editor-wysiwyg-button"
                    onClick={() => {
                        if (!wysiwygRef.current) return;
                        const json = JSON.stringify(atviewHtmlToData(wysiwygRef.current, objectStoreRef.current));
                        return navigator.clipboard.write([
                            new ClipboardItem({ "text/plain": new Blob([json], { type: "text/plain" }) }),
                        ]);
                    }}
                >
                    Copy JSON
                </button>
                <button type="button" className="control editor-wysiwyg-button" onClick={importHandler}>
                    Import
                </button>
                {onPreviewUpdate && (
                    <button type="button" className="control editor-wysiwyg-button" onClick={submitHandler}>
                        Preview
                    </button>
                )}
            </div>
        </div>
    );
};
