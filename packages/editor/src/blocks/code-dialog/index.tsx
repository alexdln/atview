"use client";

import React, { useCallback } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { bundledLanguagesInfo } from "shiki/bundle/web";
import { Input, Select, Textarea } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorCodeDialogProvider } from "../../stores/top-layer/store";

export const CodeDialog: React.FC = () => {
    const { data } = useDialogStore(EditorCodeDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorCodeDialogProvider);

    const closeHandler = useCallback(() => {
        setDialog({ open: false, data: { text: "", filename: "", language: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            store.data.onSubmit?.(store.data.text, store.data.filename, store.data.language);
            closeHandler();
        },
        [closeHandler],
    );

    return (
        <EditorCodeDialogProvider onClose={closeHandler}>
            <EditorDialog title="Code Block" onClose={closeHandler} onSubmit={submitHandler}>
                <Input
                    label="Filename"
                    type="text"
                    placeholder="code-block.ts"
                    value={data.filename}
                    onChange={(e) => setDialog({ open: true, data: { ...data, filename: e.target.value } })}
                />
                <Select
                    label="Language"
                    value={data.language}
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, language: e.target.value } })}
                >
                    <option value="">Language</option>
                    {bundledLanguagesInfo.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                            {lang.name}
                        </option>
                    ))}
                </Select>
                <Textarea
                    label="Code"
                    placeholder="console.log('Hello, world!');"
                    value={data.text}
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, text: e.target.value } })}
                />
            </EditorDialog>
        </EditorCodeDialogProvider>
    );
};
