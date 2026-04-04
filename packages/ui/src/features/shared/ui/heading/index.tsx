import React from "react";

import { Typography } from "../typography";

import "./heading.scss";

export interface HeadingProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    id: string;
    children?: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level, ...props }) => (
    <Typography size={`h${level}`} className="atview-heading" {...props} />
);
