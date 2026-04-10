import React from "react";

import { type SettingsStoreValue } from "../../stores/settings/data";
import { SettingsProvider } from "../../stores/settings/provider";
import { TopLayerProvider } from "../../stores/top-layer/provider";

export interface AtviewProviderProps {
    defaultSettings?: Partial<SettingsStoreValue>;
    children: React.ReactNode;
}

export const AtviewProvider: React.FC<AtviewProviderProps> = ({ children, defaultSettings }) => (
    <SettingsProvider defaultSettings={defaultSettings}>
        <TopLayerProvider>{children}</TopLayerProvider>
    </SettingsProvider>
);
