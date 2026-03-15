import React from "react";
import clsx from "clsx";

import { formatDate } from "@src/features/shared/core/utils/time";

import "./date-time.scss";

export interface DateTimeProps {
    date: string;
    className?: string;
}

export const DateTime: React.FC<DateTimeProps> = ({ date, className }) => {
    return (
        <time title={formatDate(date, "full-numeric")} className={clsx("date-time", className)}>
            {formatDate(date, "full-human")}
        </time>
    );
};
