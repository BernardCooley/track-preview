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