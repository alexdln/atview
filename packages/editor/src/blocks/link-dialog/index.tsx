"use client";

import React, { useCallback } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Input } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorLinkDialogProvider } from "../../stores/top-layer/store";

export const LinkDialog: React.FC = () => {
    const { data } = useDialogStore(EditorLinkDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorLinkDialogProvider);

    const closeHandler = useCallback(() => {
        setDialog({ open: false, data: { uri: "", text: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            store.data.onSubmit?.(store.data.uri, store.data.text);
            closeHandler();
        },
        [closeHandler],
    );

    return (
        <EditorLinkDialogProvider onClose={closeHandler}>
            <EditorDialog title="Link" onClose={closeHandler} onSubmit={submitHandler}>
                <Input
                    label="Link Text"
                    type="text"
                    placeholder="read more..."
                    value={data.text}
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, text: e.target.value } })}
                />
                <Input
                    label="URI"
                    type="text"
                    placeholder="https://atview.net/..."
                    value={data.uri}
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, uri: e.target.value } })}
                />
            </EditorDialog>
        </EditorLinkDialogProvider>
    );
};
