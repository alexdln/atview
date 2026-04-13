import { type RefObject } from "react";
import { type Blob } from "@atview/core";

export interface WysiwygSelectionSnapshot {
    selection: Selection;
    range: Range;
    text: string;
}

export interface WysiwygPlugin {
    id: string;
    label: string;
    appliedTag: string;
    block?: boolean;
    hotkey?: string;
    execute: () => void;
    onEnter?: () => boolean;
}

export interface FormattingPluginDefinition {
    id: string;
    label: string;
    tag: string;
    block?: boolean;
    hotkey?: string;
    htmlTag: string;
    htmlAliases?: string[];
}

export interface PseudoFacetConfig {
    tag: string;
    text: string;
    type: "inline" | "block";
    record?: Record<string, unknown>;
    styles?: Record<string, string>;
}

export interface DialogLinkData {
    uri: string;
    text: string;
    onSubmit: ((uri: string, text: string) => void) | undefined;
}

export interface DialogPostData {
    uri: string;
    cid: string;
    text: string;
    onSubmit: ((postRef: { uri: string; cid: string }, text: string) => void) | undefined;
}

export interface DialogMediaData {
    file: Blob | File | null;
    previewUrl: string;
    text: string;
    altText: string;
    caption: string;
    onSubmit: ((file: Blob | File | null, text: string, altText: string, caption: string) => void) | undefined;
}

export interface DialogCodeData {
    text: string;
    filename: string;
    language: string;
    onSubmit: ((text: string, filename: string, language: string) => void) | undefined;
}

export interface DialogMathData {
    text: string;
    onSubmit: ((text: string) => void) | undefined;
}

export interface DialogImportData {
    url: string;
    onSubmit: ((url: string) => Promise<void>) | undefined;
}

export interface DialogSetters {
    setLinkDialog: (value: { open: boolean; data: DialogLinkData }) => void;
    setPostDialog: (value: { open: boolean; data: DialogPostData }) => void;
    setMediaDialog: (value: { open: boolean; data: DialogMediaData }) => void;
    setCodeDialog: (value: { open: boolean; data: DialogCodeData }) => void;
    setImportDialog: (value: { open: boolean; data: DialogImportData }) => void;
    setMathDialog: (value: { open: boolean; data: DialogMathData }) => void;
}

export interface PluginFactoryOptions extends DialogSetters {
    editorRef: RefObject<HTMLDivElement | null>;
    objectStoreRef: RefObject<Map<string, File>>;
    normalizeEditor: () => void;
}
