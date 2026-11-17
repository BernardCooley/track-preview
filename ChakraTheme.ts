import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
    base: {
        cursor: "pointer",
        fontFamily: "Roboto, Arial, Helvetica, sans-serif",
        height: "50px",
        shadow: "md",
    },
    variants: {
        variant: {
            primary: {
                border: "1px solid",
                borderColor: "brand.backgroundTertiary",
                backgroundColor: "brand.backgroundTertiary",
                _hover: {
                    shadow: "xl",
                    border: "1px solid",
                    borderColor: "brand.primary",
                },
                color: "white",
            },
            tertiary: {
                shadow: "none",
                backgroundColor: "transparent",
                _hover: {
                    shadow: "lg",
                    outline: "1px solid",
                    outlineColor: "brand.primary",
                },
                color: "white",
                px: "0",
            },
            cancel: {
                border: "1px solid",
                borderColor: "transparent",
                backgroundColor: "brand.backgroundTertiaryOpaque",
                _hover: {
                    shadow: "xl",
                    border: "1px solid",
                    borderColor: "brand.error",
                },
                color: "brand.error",
            },
            warning: {
                border: "1px solid",
                borderColor: "transparent",
                backgroundColor: "brand.error",
                _hover: {
                    shadow: "xl",
                    border: "1px solid",
                    borderColor: "brand.error",
                },
                color: "brand.textPrimary",
            },
            menuButton: {
                shadow: "none",
                backgroundColor: "transparent",
                color: "brand.primary",
                padding: "0",
            },
            tabSelected: {
                _hover: {
                    shadow: "xl",
                },
                color: "brand.textPrimary",
                shadow: "none",
                rounded: "none",
            },
            tabDeselected: {
                color: "brand.textPrimaryLighter",
                borderBottom: "3px solid",
                borderBottomColor: "transparent",
                backgroundColor: "brand.backgroundTertiaryOpaque",
                transition: "all 0s",
                _hover: {
                    shadow: "xl",
                    borderBottomColor: "brand.textPrimaryLight",
                },
            },
        },
    },
});

const linkRecipe = defineRecipe({
    variants: {
        variant: {
            primary: {
                color: "brand.primary",
                fontWeight: "bold",
                _hover: {
                    color: "brand.primaryLight",
                },
                fontSize: "xl",
                textUnderlineOffset: "6px",
                textAlign: "center",
            },
        },
    },
});

const config = defineConfig({
    globalCss: {
        body: {
            color: "brand.textPrimary",
            background:
                "linear-gradient(to bottom, var(--chakra-colors-brand-background-primary), var(--chakra-colors-brand-background-secondary))",
            backgroundRepeat: "no-repeat",
            height: "100vh",
        },
    },
    theme: {
        recipes: {
            button: buttonRecipe,
            link: linkRecipe,
        },
        tokens: {
            colors: {
                brand: {
                    primary: { value: "#11999e" },
                    primaryOpaque: { value: "rgba(16, 152, 157, 0.47)" },
                    primaryLight: { value: "#16c6cc" },
                    textPrimary: { value: "#FFFFFF" },
                    textPrimaryLight: { value: "#b7c0c2" },
                    textPrimaryLighter: { value: "#809093" },
                    textSecondary: { value: "#383838" },
                    backgroundPrimary: { value: "#293533" },
                    backgroundSecondary: { value: "#40514e" },
                    backgroundTertiary: { value: "#576d69" },
                    backgroundTertiaryOpaque: {
                        value: "rgba(86, 108, 104, 0.46)",
                    },
                    backgroundTertiaryOpaque2: {
                        value: "rgba(86, 108, 104, 0.15)",
                    },
                    backgroundTertiaryOpaque3: {
                        value: "rgba(86, 108, 104, 0.80)",
                    },
                    backgroundLightPrimary: { value: "#d6dbdc" },
                    backgroundLightSecondary: { value: "#FFFFFF" },
                    error: { value: "#ff0000" },
                },
                primary: {
                    50: { value: "#f1f9f9" },
                    100: { value: "#c6e6e8" },
                    200: { value: "#92d0d3" },
                    300: { value: "#51b4b8" },
                    400: { value: "#29a3a8" },
                    500: { value: "#0f8b8f" },
                    600: { value: "#0d7579" },
                    700: { value: "#0a5e61" },
                    800: { value: "#095052" },
                    900: { value: "#063a3b" },
                },
            },
            fonts: {
                heading: { value: "Roboto, Arial, Helvetica, sans-serif" },
                body: { value: "Roboto, Arial, Helvetica, sans-serif" },
                brand: {
                    value: "'Allerta Stencil', Arial, Helvetica, sans-serif",
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
