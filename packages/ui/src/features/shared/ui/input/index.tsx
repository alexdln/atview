import React from "react";
import clsx from "clsx";

import { Label } from "../label";

import "./input.scss";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    required?: boolean;
    inputClassName?: string;
    ref?: React.RefAttributes<HTMLInputElement>["ref"];
}

export const Input = ({ className, label, required, inputClassName, ref, ...props }: InputProps) => {
    return (
        <Label text={label} required={required} className={className}>
            <input className={clsx("input", inputClassName)} required={required} {...props} ref={ref} />
        </Label>
    );
};
