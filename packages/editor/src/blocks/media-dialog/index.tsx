"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Input, Textarea, Typography } from "@atview/ui";

import { EditorDialog } from "../editor-dialog";
import { EditorMediaDialogProvider } from "../../stores/top-layer/store";

export const MediaDialog: React.FC = () => {
    const { data } = useDialogStore(EditorMediaDialogProvider);
    const [, setDialog] = useDialogReducer(EditorMediaDialogProvider);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(data.previewUrl || null);

    const closeHandler = useCallback(() => {
        setDialog({
            open: false,
            data: { file: null, previewUrl: "", text: "", altText: "", caption: "", onSubmit: undefined },
        });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            data.onSubmit?.(data.file ?? null, data.text, data.altText, data.caption);
            closeHandler();
        },
        [closeHandler, data],
    );

    const registerFileInput = useCallback(
        (node: HTMLInputElement) => {
            fileInputRef.current = node;

            if (!node) return;

            if (!(data.file instanceof File)) {
                node.value = "";
                return;
            }

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(data.file);
            node.files = dataTransfer.files;
        },
        [data.file],
    );

    useEffect(() => {
        if (!(data.file instanceof File)) {
            setFilePreviewUrl(data.previewUrl || null);
            return;
        }

        if (data.previewUrl.startsWith("blob:")) {
            setFilePreviewUrl(data.previewUrl);
            return;
        }

        const previewUrl = URL.createObjectURL(data.file);
        setFilePreviewUrl(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [data.file, data.previewUrl]);

    const requireFile = !data.file && !data.previewUrl;

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
                {filePreviewUrl && (
                    <div style={{ marginTop: 12 }}>
                        <Typography size="caption">Current Media</Typography>
                        <img
                            src={filePreviewUrl}
                            alt={data.altText || "Selected media preview"}
                            style={{
                                display: "block",
                                width: "100%",
                                maxHeight: 240,
                                marginTop: 8,
                                objectFit: "contain",
                                borderRadius: 8,
                            }}
                        />
                    </div>
                )}
                <Input
                    label="File"
                    type="file"
                    accept="image/*"
                    required={requireFile}
                    ref={registerFileInput}
                    onChange={(e) =>
                        setDialog({
                            open: true,
                            data: {
                                ...data,
                                file: e.target.files?.[0] ?? null,
                                previewUrl: "",
                            },
                        })
                    }
                />
            </EditorDialog>
        </EditorMediaDialogProvider>
    );
};
