import React from "react";

import "./strikethrough.scss";

export interface StrikethroughProps {
    children: React.ReactNode;
}

export const Strikethrough: React.FC<StrikethroughProps> = (props) => <s className="atview-strikethrough" {...props} />;
