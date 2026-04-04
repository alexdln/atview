"use client";

import React from "react";
import { Typography, Button } from "@atview/ui";

import "./editor-dialog.scss";

export interface EditorDialogProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

export const EditorDialog: React.FC<EditorDialogProps> = ({ title, children, onClose, onSubmit }) => (
    <>
        <div className="editor-dialog-overlay" onClick={onClose} />
        <div className="editor-dialog">
            <form className="editor-dialog-form" onSubmit={onSubmit}>
                <Typography size="h3" component="p">
                    {title}
                </Typography>
                <div className="editor-dialog-body">{children}</div>
                <div className="editor-dialog-footer">
                    <Button type="button" variant="neutral" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </div>
    </>
);
