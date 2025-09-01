import React from "react";

interface ButtonProps {
    name: string;
    type?: "submit" | "reset" | "button";
    value?: string;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

export function Button({ name, type, value, onClick, className }: ButtonProps) {
    return (
        <button
        type={type}
        value={value}
        onClick={onClick}
        className={`p-2 m-2 w-50 rounded-lg hover:brightness-75 transition-all duration-200 ${className}`}
        >{name}</button>
    )
}