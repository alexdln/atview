export const formatCount = (count: number) => {
    if (count > 1000000) return Math.round(count / 100000) / 10 + "M";

    if (count > 1000) return Math.round(count / 100) / 10 + "K";

    return count;
};

export const normalizeNumber = (number: number) => (number < 10 ? `0${number}` : number);

export const parseDate = (date: Date) => {
    const dateString = `${date.getFullYear()}-${normalizeNumber(date.getMonth() + 1)}-${normalizeNumber(date.getDate())}`;

    return {
        dateString,
        tz: String(new Date().getTimezoneOffset() / 60),
    };
};

export const normalizeDate = (d: number | string) => (+d < 10 ? `0${d}` : d.toString());
