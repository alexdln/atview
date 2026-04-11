"use client";

import React from "react";

import { EditorTopLayerStore } from "./store";
import { LinkDialog } from "../../blocks/link-dialog";
import { PostDialog } from "../../blocks/post-dialog";
import { MediaDialog } from "../../blocks/media-dialog";
import { CodeDialog } from "../../blocks/code-dialog";
import { ImportDialog } from "../../blocks/import-dialog";
import { MathDialog } from "../../blocks/math-dialog";

export interface EditorTopLayerProviderProps {
    children: React.ReactNode;
}

export const EditorTopLayerProvider: React.FC<EditorTopLayerProviderProps> = ({ children }) => (
    <EditorTopLayerStore.TopLayerStore>
        {children}
        <LinkDialog />
        <PostDialog />
        <MediaDialog />
        <CodeDialog />
        <ImportDialog />
        <MathDialog />
    </EditorTopLayerStore.TopLayerStore>
);
