"use client";

import React, { useCallback } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Textarea } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorMathDialogProvider } from "../../stores/top-layer/store";

export const MathDialog: React.FC = () => {
    const { data } = useDialogStore(EditorMathDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorMathDialogProvider);

    const closeHandler = useCallback(() => {
        setDialog({ open: false, data: { text: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            store.data.onSubmit?.(store.data.text);
            closeHandler();
        },
        [closeHandler],
    );

    return (
        <EditorMathDialogProvider onClose={closeHandler}>
            <EditorDialog title="Math Block" onClose={closeHandler} onSubmit={submitHandler}>
                <Textarea
                    label="TeX"
                    placeholder="e.g. sum_{i=1}^n i = frac{n(n+1)}{2}"
                    value={data.text}
                    onChange={(e) => setDialog({ open: true, data: { ...data, text: e.target.value } })}
                    required
                />
            </EditorDialog>
        </EditorMathDialogProvider>
    );
};
