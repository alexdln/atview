export const LIST_PREFIXES: Record<string, string> = {
    ul: "- ",
    ol: "1. ",
};

export const isListTag = (tag: string): tag is "ul" | "ol" => tag in LIST_PREFIXES;

export const stripListPrefix = (line: string, tag: string) => {
    if (tag === "ul") return line.replace(/^-\s?/, "");
    if (tag === "ol") return line.replace(/^[0-9]+\.\s?/, "");
    return line;
};

export const formatAsListText = (text: string, tag: "ul" | "ol") =>
    text
        .split("\n")
        .map((line) => `${LIST_PREFIXES[tag]}${line.trim()}`)
        .join("\n");

export const listElementToText = (element: HTMLElement, tag: "ul" | "ol") =>
    Array.from(element.children)
        .filter((el): el is HTMLLIElement => el.tagName === "LI")
        .map((li, i) => `${tag === "ol" ? `${i + 1}.` : "-"} ${li.textContent?.trim() || ""}`)
        .join("\n");

export const textToListElement = (doc: Document, text: string, tag: "ul" | "ol") => {
    const list = doc.createElement(tag);
    text.split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
            const li = doc.createElement("li");
            li.textContent = stripListPrefix(line, tag);
            list.appendChild(li);
        });
    return list;
};
