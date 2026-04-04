import { type BuiltinLanguage } from "shiki";

export interface CodeBlockProps {
    code: string;
    lang?: BuiltinLanguage;
    className?: string;
    inline?: boolean;
}
