import { extendTheme } from "@chakra-ui/react";

export const primary = "#006efa";
const pageBackground = "#F1EFEFFF";

export const theme = extendTheme({
    fonts: {
        heading: `Roboto, Arial, Helvetica, sans-serif`,
        body: `Roboto, Arial, Helvetica, sans-serif`,
        // 'Allerta Stencil'
    },
    // colors: {
    //     brand: {
    //         primary: primary,
    //         white: "#ffffff",
    //         featuresNavInactive: "rgba(34, 34, 34, 0.6)",
    //         blockBody: "#F8F8F8",
    //         blockChip: "#E5E5E5",
    //         blockBorder: "#EEEEEE",
    //         darkText: "#222222",
    //         pageBackground: pageBackground,
    //         lightTitle: "#767676",
    //         error: "#FF0000",
    //         interactive: "#0058C8",
    //         textDisabled: "#858585",
    //     },
    //     gpBlue: {
    //         50: "#E5F0FE",
    //         100: "#aed4ff",
    //         200: "#7db8ff",
    //         300: "#4b9bff",
    //         400: "#1a7eff",
    //         500: primary,
    //         600: "#004fb4",
    //         700: "#003882",
    //         800: "#002251",
    //         900: "#000b21",
    //     },
    // },
});
