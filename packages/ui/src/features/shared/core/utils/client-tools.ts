export const formatCount = (count: number) => {
    if (count > 1000000) return Math.round(count / 100000) / 10 + "M";

    if (count > 1000) return Math.round(count / 100) / 10 + "K";

    return count;
};
