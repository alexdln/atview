import React from "react";
import clsx from "clsx";

import "./button.scss";

const VARIANTS = {
    primary: "button-primary",
    secondary: "button-secondary",
    neutral: "button-neutral",
};

type ButtonProps<T extends React.ElementType> = {
    as?: T;
    variant?: keyof typeof VARIANTS;
    block?: boolean;
    children: React.ReactNode;
} & Omit<React.ComponentProps<T>, "as" | "color" | "children">;

export const Button = <T extends React.ElementType = "button">({
    as,
    className,
    variant = "primary",
    block,
    children,
    ...props
}: ButtonProps<T>) => {
    const Component = as || "button";

    return (
        <Component className={clsx("button", VARIANTS[variant], block && "button-block", className)} {...props}>
            <span className="button__label">{children}</span>
        </Component>
    );
};
