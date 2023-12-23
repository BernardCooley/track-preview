export const removeDuplicates = (arr: string[]) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
};

export const removeBracketedText = (str: string) => {
    return str.replace(/ *\([^)]*\) */g, "");
};

export const arrayRange = (start: number, stop: number, step: number) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

export const getCurrentYear = () => {
    return new Date().getFullYear();
};

export const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};