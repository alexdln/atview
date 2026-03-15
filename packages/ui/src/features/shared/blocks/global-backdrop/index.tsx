"use client";

import React from "react";

import { useTopLayerStore } from "contection-top-layer";

import { TopLayerStore } from "@src/features/shared/stores/top-layer/stores";

import "./global-backdrop.scss";

export const GlobalBackdrop = () => {
    const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
        keys: ["hasActiveIsolatedLayers"],
    });

    if (!hasActiveIsolatedLayers) return null;

    return <div className="global-backdrop" />;
};
