import React from "react";

import "./italic.scss";

export interface ItalicProps {
    children: React.ReactNode;
}

export const Italic: React.FC<ItalicProps> = (props) => <i className="atview-italic" {...props} />;
