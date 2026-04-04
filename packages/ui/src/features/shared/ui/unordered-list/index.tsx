import React from "react";

import "./unordered-list.scss";

export interface UnorderedListProps {
    children: React.ReactNode;
}

export const UnorderedList: React.FC<UnorderedListProps> = ({ children }) => {
    return <ul className="atview-unordered-list">{children}</ul>;
};
