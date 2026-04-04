import React from "react";
import clsx from "clsx";

import { Label } from "../label";

import "./select.scss";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    required?: boolean;
    selectClassName?: string;
}

export const Select = ({ className, label, required, selectClassName, ...props }: SelectProps) => {
    return (
        <Label text={label} required={required} className={className}>
            <select className={clsx("select", selectClassName)} {...props} />
        </Label>
    );
};
