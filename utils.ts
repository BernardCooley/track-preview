export const removeDuplicates = (arr: string[]) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
};

export const removeBracketedText = (str: string) => {
    return str.replace(/ *\([^)]*\) */g, "");
};