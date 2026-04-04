import React from "react";

import { Typography } from "../typography";

import "./paragraph.scss";

export interface ParagraphProps {
    children: React.ReactNode;
}

export const Paragraph: React.FC<ParagraphProps> = (props) => <Typography className="atview-paragraph" {...props} />;
