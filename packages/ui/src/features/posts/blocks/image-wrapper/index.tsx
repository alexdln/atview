"use client";

import React from "react";

import { useDialogReducer } from "contection-top-layer";

import { FullViewDialogProvider } from "@src/features/shared/stores/top-layer/stores";

export interface ImageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    uris: { img: string; webp?: string; fullUri?: string; alt?: string }[];
    index: number;
}

export const ImageWrapper = ({ children, uris, index, ...props }: ImageWrapperProps) => {
    const [, setDialogState] = useDialogReducer(FullViewDialogProvider);
    return (
        <div onClick={() => setDialogState({ data: { uris, index }, open: true })} {...props}>
            {children}
        </div>
    );
};
