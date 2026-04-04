"use client";

import React, { useCallback } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Input, Textarea } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorMediaDialogProvider } from "../../stores/top-layer/store";

export const MediaDialog: React.FC = () => {
    const { data } = useDialogStore(EditorMediaDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorMediaDialogProvider);

    const closeHandler = useCallback(() => {
        setDialog({ open: false, data: { file: null, text: "", altText: "", caption: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            store.data.onSubmit?.(store.data.file, store.data.text, store.data.altText, store.data.caption);
            closeHandler();
        },
        [closeHandler],
    );

    return (
        <EditorMediaDialogProvider onClose={closeHandler}>
            <EditorDialog title="Media" onClose={closeHandler} onSubmit={submitHandler}>
                <Input
                    label="Default Text"
                    type="text"
                    placeholder="Default text for text-content-only services"
                    value={data.text}
                    onChange={(e) => setDialog({ open: true, data: { ...data, text: e.target.value } })}
                />
                <Textarea
                    label="Alt text"
                    placeholder="A description of the media for accessibility"
                    value={data.altText}
                    onChange={(e) => setDialog({ open: true, data: { ...data, altText: e.target.value } })}
                />
                <Textarea
                    label="Caption"
                    placeholder="A caption for the media"
                    value={data.caption}
                    onChange={(e) => setDialog({ open: true, data: { ...data, caption: e.target.value } })}
                />
                <Input
                    label="File"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, file: e.target.files?.[0] || null } })}
                />
            </EditorDialog>
        </EditorMediaDialogProvider>
    );
};
