import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
    fonts: {
        heading: `Roboto, Arial, Helvetica, sans-serif`,
        body: `Roboto, Arial, Helvetica, sans-serif`,
        brand: `'Allerta Stencil', Arial, Helvetica, sans-serif`,
    },
    colors: {
        brand: {
            primary: "#11999e",
            primaryLight: "#16c6cc",
            textPrimary: "#FFFFFF",
            backgroundPrimary: "#293533",
            backgroundSecondary: "#40514e",
            backgroundTertiary: "#576d69",
            backgroundTertiaryOpaque: "rgba(86, 108, 104, 0.46)",
            backgroundLightPrimary: "#d6dbdc",
            backgroundLightSecondary: "#ffffff",
        },
        primary: {
            "50": "#f1f9f9",
            "100": "#c6e6e8",
            "200": "#92d0d3",
            "300": "#51b4b8",
            "400": "#29a3a8",
            "500": "#0f8b8f",
            "600": "#0d7579",
            "700": "#0a5e61",
            "800": "#095052",
            "900": "#063a3b",
        },
    },
    components: {
        Button: {
            baseStyle: {
                border: 0,
                cursor: "pointer",
                fontFamily: "Roboto, Arial, Helvetica, sans-serif",
            },
            variants: {
                outlined: {
                    border: "initial",
                },
                primary: {
                    height: "50px",
                    size: "lg",
                    border: "1px solid",
                    borderColor: "brand.backgroundTertiary",
                    shadow: "md",
                    backgroundColor: "brand.backgroundTertiary",
                    _hover: {
                        shadow: "xl",
                        border: "1px solid",
                        borderColor: "brand.primary",
                    },
                    color: "white",
                },
            },
        },
        Input: {
            variants: {
                primary: {
                    field: {
                        height: "70px",
                        border: "1px solid",
                        borderColor: "brand.backgroundPrimary",
                        shadow: "md",
                        backgroundColor: "brand.backgroundTertiaryOpaque",
                        color: "white",
                        _focus: {
                            shadow: "xl",
                            borderColor: "brand.primary",
                        },
                    },
                },
            },
        },
    },
    styles: {
        global: () => ({
            body: {
                color: "brand.textPrimary",
                bgGradient:
                    "linear(to-b, brand.backgroundPrimary, brand.backgroundSecondary)",
            },
        }),
    },
});
