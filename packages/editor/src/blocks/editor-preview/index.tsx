"use client";

import React, { useEffect, useState } from "react";

import { WysiwygData, WysiwygEngine } from "../wysiwyg";
import { EditorRenderer } from "../editor-renderer";

export interface EditorPreviewProps<Engine extends WysiwygEngine> extends React.HTMLAttributes<HTMLDivElement> {
    previewUpdateRef: React.RefObject<((data: WysiwygData<Engine>) => void) | null>;
    authorDid?: string;
}

export const EditorPreview = <Engine extends WysiwygEngine>({
    previewUpdateRef,
    authorDid,
    ...props
}: EditorPreviewProps<Engine>) => {
    const [data, setData] = useState<WysiwygData<Engine> | null>(null);

    useEffect(() => {
        previewUpdateRef.current = (data: WysiwygData<Engine>) => {
            if (data.engine === "facets") {
                setData(data);
            } else {
                setData(data);
            }
        };
        return () => {
            previewUpdateRef.current = null;
        };
    }, [previewUpdateRef]);

    return <div {...props}>{data && <EditorRenderer data={data} authorDid={authorDid} />}</div>;
};
