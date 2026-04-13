"use client";

import { type Blob } from "@atview/core";
import { createTopLayer } from "contection-top-layer";

export const EditorTopLayerStore = createTopLayer({
    dialogs: {
        EditorLinkDialogProvider: {
            data: {
                uri: "",
                text: "",
                onSubmit: undefined as ((uri: string, text: string) => void) | undefined,
            },
        },
        EditorPostDialogProvider: {
            data: {
                uri: "",
                cid: "",
                text: "",
                onSubmit: undefined as ((postRef: { uri: string; cid: string }, text: string) => void) | undefined,
            },
        },
        EditorMediaDialogProvider: {
            data: {
                file: null as Blob | File | null,
                previewUrl: "",
                text: "",
                altText: "",
                caption: "",
                onSubmit: undefined as
                    | ((file: Blob | File | null, text: string, altText: string, caption: string) => void)
                    | undefined,
            },
        },
        EditorCodeDialogProvider: {
            data: {
                text: "",
                filename: "",
                language: "",
                onSubmit: undefined as ((text: string, filename: string, language: string) => void) | undefined,
            },
        },
        EditorMathDialogProvider: {
            data: {
                text: "",
                onSubmit: undefined as ((text: string) => void) | undefined,
            },
        },
        EditorImportDialogProvider: {
            data: {
                url: "",
                onSubmit: undefined as ((url: string) => Promise<void>) | undefined,
            },
        },
    },
});

export const {
    EditorLinkDialogProvider,
    EditorPostDialogProvider,
    EditorMediaDialogProvider,
    EditorCodeDialogProvider,
    EditorImportDialogProvider,
    EditorMathDialogProvider,
} = EditorTopLayerStore.Dialogs;
