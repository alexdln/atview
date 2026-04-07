import React from "react";
import { LinkBase } from "../link-base";

export interface LinkProps {
    href: string;
    children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children }) =>
    href ? (
        <LinkBase underline variant="accent" target="_blank" rel="noopener noreferrer" href={href}>
            {children}
        </LinkBase>
    ) : (
        children
    );
