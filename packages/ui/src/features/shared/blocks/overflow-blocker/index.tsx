"use client";

import { useEffect } from "react";
import { useTopLayerStore } from "contection-top-layer";

import { TopLayerStore } from "@src/features/shared/stores/top-layer/stores";

export const OverflowBlocker = () => {
    const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
        keys: ["hasActiveIsolatedLayers"],
    });

    useEffect(() => {
        if (hasActiveIsolatedLayers) {
            document.documentElement.style.overflow = "hidden";
        } else {
            document.documentElement.style.removeProperty("overflow");
        }
    }, [hasActiveIsolatedLayers]);

    return null;
};
