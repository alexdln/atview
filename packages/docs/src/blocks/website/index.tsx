import React from "react";

import { Link, Typography } from "@atview/ui";

import "./website.scss";

export interface WebsiteProps {
    uri: string;
    children?: React.ReactNode;
}

export const Website: React.FC<WebsiteProps> = ({ uri, children }) => (
    <Typography className="atview-website">
        <Link href={uri}>{children || uri}</Link>
    </Typography>
);
