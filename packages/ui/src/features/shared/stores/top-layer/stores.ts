"use client";

import { createTopLayer } from "contection-top-layer";

export const { TopLayerStore, Dialogs } = createTopLayer({
    dialogs: {
        FullViewDialogProvider: {
            data: {
                uris: [] as { img: string; webp?: string; fullUri?: string; ready?: boolean; alt?: string }[],
                index: 0,
            },
            isolated: true,
        },
    },
});

export const { FullViewDialogProvider } = Dialogs;
