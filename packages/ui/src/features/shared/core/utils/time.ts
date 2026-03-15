export function formatRelativeTime(dateArg: Date | string): string {
    const now = new Date();
    const date = typeof dateArg === "string" ? new Date(dateArg) : dateArg;
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d`;
    }

    const isSameYear = now.getFullYear() === date.getFullYear();
    if (isSameYear) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
}

export function formatFullDate(dateArg: Date | string): string {
    const date = typeof dateArg === "string" ? new Date(dateArg) : dateArg;

    const parts = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

    return `${map.month} ${map.day}, ${map.year}, ${map.hour}:${map.minute}`;
}

export function formatFullNumericDate(dateArg: Date | string): string {
    const date = typeof dateArg === "string" ? new Date(dateArg) : dateArg;
    const parts = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

    return `${map.month}-${map.day}-${map.year}, ${map.hour}:${map.minute}`;
}

export function formatDate(
    dateArg: Date | string,
    format: "full-human" | "full-numeric" | "relative" = "full-human",
): string {
    const date = typeof dateArg === "string" ? new Date(dateArg) : dateArg;
    if (format === "full-human") {
        return formatFullDate(date);
    } else if (format === "full-numeric") {
        return formatFullNumericDate(date);
    } else {
        return formatRelativeTime(date);
    }
}
