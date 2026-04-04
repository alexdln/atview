import React from "react";

import "./table-head-cell.scss";

export interface TableHeadCellProps {
    children: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
}

export const TableHeadCell: React.FC<TableHeadCellProps> = (props) => (
    <th className="atview-table-head-cell" {...props} />
);
