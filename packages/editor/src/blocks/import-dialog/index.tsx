"use client";

import React, { useCallback, useState } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Input } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorImportDialogProvider } from "../../stores/top-layer/store";

export const ImportDialog: React.FC = () => {
    const { data } = useDialogStore(EditorImportDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorImportDialogProvider);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const closeHandler = useCallback(() => {
        setLoading(false);
        setError("");
        setDialog({ open: false, data: { url: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (!store.data.onSubmit || !store.data.url.trim()) return;

            setLoading(true);
            setError("");

            try {
                await store.data.onSubmit(store.data.url.trim());
                closeHandler();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Import failed");
                setLoading(false);
            }
        },
        [closeHandler],
    );

    return (
        <EditorImportDialogProvider onClose={closeHandler}>
            <EditorDialog title="Import from Medium" onClose={closeHandler} onSubmit={submitHandler}>
                <Input
                    label="URL"
                    type="url"
                    placeholder="https://medium.com/..."
                    value={data.url}
                    required
                    onChange={(e) => setDialog({ open: true, data: { ...data, url: e.target.value } })}
                    disabled={loading}
                />
                {error && <p className="editor-dialog-error">{error}</p>}
                {loading && <p className="editor-dialog-status">Importing article...</p>}
            </EditorDialog>
        </EditorImportDialogProvider>
    );
};
