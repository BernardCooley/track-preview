import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
    base: {
        cursor: "pointer",
        fontFamily: "body",
        fontWeight: "medium",
        transition: "all 0.2s ease",
        rounded: "lg",
    },
    variants: {
        variant: {
            primary: {
                bg: "brand.primary",
                color: "brand.textOnPrimary",
                shadow: "sm",
                _hover: {
                    bg: "brand.primaryHover",
                    shadow: "md",
                    transform: "translateY(-1px)",
                },
                _active: {
                    transform: "translateY(0)",
                    shadow: "sm",
                },
                height: "48px",
                px: "6",
            },
            // "secondary" - mapped to "outline"
            outline: {
                bg: "brand.surface",
                color: "brand.textPrimary",
                border: "1px solid",
                borderColor: "brand.border",
                shadow: "xs",
                _hover: {
                    borderColor: "brand.primary",
                    bg: "brand.surfaceHover",
                    shadow: "sm",
                },
                height: "48px",
                px: "6",
            },
            ghost: {
                bg: "transparent",
                color: "brand.textSecondary",
                shadow: "none",
                _hover: {
                    bg: "brand.surfaceHover",
                    color: "brand.textPrimary",
                },
                height: "40px",
                px: "3",
            },
            // "danger" - mapped to "warning"
            warning: {
                bg: "brand.error",
                color: "white",
                shadow: "sm",
                _hover: {
                    bg: "brand.errorHover",
                    shadow: "md",
                    transform: "translateY(-1px)",
                },
                _active: {
                    transform: "translateY(0)",
                },
                height: "48px",
                px: "6",
            },
            // "dangerOutline" - mapped to "cancel"
            cancel: {
                bg: "transparent",
                color: "brand.error",
                border: "1px solid",
                borderColor: "brand.error",
                shadow: "none",
                _hover: {
                    bg: "brand.errorSubtle",
                    shadow: "sm",
                },
                height: "48px",
                px: "6",
            },
            // "tabActive" - mapped to "tabSelected"
            tabSelected: {
                bg: "transparent",
                color: "brand.primary",
                rounded: "none",
                shadow: "none",
                borderBottom: "2px solid",
                borderBottomColor: "brand.primary",
                height: "48px",
                px: "4",
                fontWeight: "semibold",
            },
            // "tab" - mapped to "tabDeselected"
            tabDeselected: {
                bg: "transparent",
                color: "brand.textMuted",
                rounded: "none",
                shadow: "none",
                borderBottom: "2px solid",
                borderBottomColor: "transparent",
                height: "48px",
                px: "4",
                _hover: {
                    color: "brand.textSecondary",
                    bg: "brand.surfaceHover",
                },
            },
            // "icon" - mapped to "tertiary"
            tertiary: {
                bg: "transparent",
                color: "brand.textSecondary",
                shadow: "none",
                rounded: "full",
                _hover: {
                    bg: "brand.surfaceHover",
                    color: "brand.primary",
                },
                height: "40px",
                width: "40px",
                minWidth: "40px",
                px: "0",
            },
            menuButton: {
                shadow: "none",
                bg: "transparent",
                color: "brand.primary",
                padding: "0",
                height: "auto",
                _hover: {
                    color: "brand.primaryHover",
                },
            },
            // "filterTag" - mapped to "surface"
            surface: {
                bg: "brand.surface",
                color: "brand.textPrimary",
                border: "1px solid",
                borderColor: "brand.border",
                rounded: "full",
                height: "36px",
                px: "4",
                fontSize: "sm",
                fontWeight: "normal",
                shadow: "xs",
                _hover: {
                    borderColor: "brand.primary",
                    bg: "brand.primarySubtle",
                    shadow: "sm",
                    cursor: "pointer",
                },
            },
            // "filterTagActive" - mapped to "subtle"
            subtle: {
                bg: "brand.primarySubtle",
                color: "brand.primary",
                border: "1px solid",
                borderColor: "brand.primary",
                rounded: "full",
                height: "36px",
                px: "4",
                fontSize: "sm",
                fontWeight: "medium",
                shadow: "xs",
                _hover: {
                    bg: "brand.surface",
                    borderColor: "brand.border",
                    color: "brand.textPrimary",
                    cursor: "pointer",
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
                fontWeight: "medium",
                _hover: {
                    color: "brand.primaryHover",
                },
                textUnderlineOffset: "4px",
            },
        },
    },
});

const config = defineConfig({
    globalCss: {
        body: {
            color: "brand.textPrimary",
            bg: "brand.bg",
            fontFamily: "body",
            lineHeight: "1.6",
            minHeight: "100vh",
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
                    // Core palette - change these to retheme the whole app
                    primary: { value: "#11999e" },
                    primaryHover: { value: "#0e8286" },
                    primarySubtle: { value: "rgba(17, 153, 158, 0.12)" },
                    primaryMuted: { value: "rgba(17, 153, 158, 0.4)" },
                    textOnPrimary: { value: "#ffffff" },

                    // Backgrounds
                    bg: { value: "#1a2422" },
                    bgSubtle: { value: "#1e2b28" },
                    surface: { value: "rgba(255, 255, 255, 0.06)" },
                    surfaceHover: { value: "rgba(255, 255, 255, 0.1)" },
                    surfaceRaised: { value: "rgba(255, 255, 255, 0.08)" },
                    overlay: { value: "rgba(0, 0, 0, 0.6)" },

                    // Text
                    textPrimary: { value: "#f0f4f3" },
                    textSecondary: { value: "#a8b5b2" },
                    textMuted: { value: "#6b7d79" },
                    textOnSurface: { value: "#d0d8d6" },

                    // Borders
                    border: { value: "rgba(255, 255, 255, 0.1)" },
                    borderHover: { value: "rgba(255, 255, 255, 0.2)" },
                    borderFocus: { value: "#11999e" },

                    // Status colors
                    error: { value: "#ef4444" },
                    errorHover: { value: "#dc2626" },
                    errorSubtle: { value: "rgba(239, 68, 68, 0.12)" },
                    success: { value: "#22c55e" },
                    successSubtle: { value: "rgba(34, 197, 94, 0.12)" },

                    // Specific UI elements
                    cardBg: { value: "rgba(255, 255, 255, 0.04)" },
                    inputBg: { value: "rgba(255, 255, 255, 0.06)" },
                    inputBorder: { value: "rgba(255, 255, 255, 0.12)" },
                    divider: { value: "rgba(255, 255, 255, 0.08)" },

                    // Action colors for like/dislike
                    like: { value: "#22c55e" },
                    likeSubtle: { value: "rgba(34, 197, 94, 0.15)" },
                    dislike: { value: "#ef4444" },
                    dislikeSubtle: { value: "rgba(239, 68, 68, 0.15)" },
                },
                primary: {
                    50: { value: "#f0fafa" },
                    100: { value: "#c6e8e9" },
                    200: { value: "#92d0d3" },
                    300: { value: "#51b4b8" },
                    400: { value: "#29a3a8" },
                    500: { value: "#11999e" },
                    600: { value: "#0e8286" },
                    700: { value: "#0a6a6d" },
                    800: { value: "#085255" },
                    900: { value: "#053a3c" },
                },
            },
            fonts: {
                heading: { value: "'Inter', 'Roboto', -apple-system, sans-serif" },
                body: { value: "'Inter', 'Roboto', -apple-system, sans-serif" },
                brand: { value: "'Allerta Stencil', 'Inter', sans-serif" },
            },
            radii: {
                card: { value: "16px" },
                modal: { value: "20px" },
                button: { value: "10px" },
                input: { value: "10px" },
                tag: { value: "9999px" },
            },
            spacing: {
                page: { value: "24px" },
                section: { value: "32px" },
                card: { value: "20px" },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
