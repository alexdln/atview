import React from "react";

import "./inline-code.scss";

export interface InlineCodeProps {
    children: React.ReactNode;
}

export const InlineCode: React.FC<InlineCodeProps> = (props) => <code className="atview-inline-code" {...props} />;
