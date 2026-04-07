import React from "react";

import { LinkBase } from "../link-base";

export interface MentionProps {
    did: string;
    children: React.ReactNode;
}

export const Mention: React.FC<MentionProps> = ({ did, ...props }) => (
    <LinkBase
        underline
        variant="accent"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://bsky.app/profile/${did}`}
        {...props}
    />
);
