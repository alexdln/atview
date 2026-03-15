import React from "react";

import { TopLayerStore } from "./stores";
import { GlobalBackdrop } from "../../blocks/global-backdrop";
import { OverflowBlocker } from "../../blocks/overflow-blocker";
import { FullViewDialog } from "@src/features/posts/blocks/full-view";

export const TopLayerProvider = ({ children }: { children: React.ReactNode }) => (
    <TopLayerStore>
        {children}
        <GlobalBackdrop />
        <FullViewDialog />
        <OverflowBlocker />
    </TopLayerStore>
);
