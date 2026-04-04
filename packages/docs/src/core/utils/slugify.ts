type SlugifyOptions = {
    separator?: string;
    lowercase?: boolean;
};

export function slugify(input: string, options: SlugifyOptions = {}): string {
    const { separator = "-", lowercase = true } = options;

    let slug = input
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, separator)
        .replace(new RegExp(`${separator}+`, "g"), separator);

    if (lowercase) slug = slug.toLowerCase();

    return slug || "heading";
}

export function createSlugGenerator(optionsGlobal?: SlugifyOptions) {
    const counts = new Map<string, number>();

    return (input: string, options?: SlugifyOptions) => {
        const base = slugify(input, optionsGlobal || options);
        const count = counts.get(base) ?? 0;
        counts.set(base, count + 1);

        return count === 0 ? base : `${base}-${count}`;
    };
}
