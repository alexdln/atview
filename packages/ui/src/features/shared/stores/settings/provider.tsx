"use client";

import React from "react";

import { DEFAULT_SETTINGS, type SettingsStoreValue } from "./data";
import { SettingsStore } from "./stores";

export interface SettingsProviderProps {
    defaultSettings?: Partial<SettingsStoreValue>;
    children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ defaultSettings, children }) => (
    <SettingsStore value={{ ...DEFAULT_SETTINGS, ...defaultSettings }}>{children}</SettingsStore>
);
