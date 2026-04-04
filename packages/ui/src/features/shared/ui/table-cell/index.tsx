import React from "react";

import "./table-cell.scss";

export interface TableCellProps {
    children: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = (props) => <td className="atview-table-cell" {...props} />;
