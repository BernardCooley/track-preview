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
                shadow: "none",
                rounded: "full",
                _hover: {
                    bg: "brand.primaryHover",
                    shadow: "sm",
                },
                _active: {
                    opacity: 0.85,
                },
                height: "40px",
                paddingInline: "2rem !important",
                fontSize: "sm",
            },
            outline: {
                bg: "transparent",
                color: "brand.textSecondary",
                border: "1px solid",
                borderColor: "brand.border",
                shadow: "none",
                rounded: "full",
                _hover: {
                    borderColor: "brand.borderHover",
                    color: "brand.textPrimary",
                    bg: "brand.surfaceHover",
                },
                height: "40px",
                paddingInline: "2rem !important",
                fontSize: "sm",
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
            warning: {
                bg: "brand.error",
                color: "white",
                shadow: "none",
                rounded: "full",
                _hover: {
                    bg: "brand.errorHover",
                    shadow: "sm",
                },
                _active: {
                    opacity: 0.85,
                },
                height: "40px",
                paddingInline: "2rem !important",
                fontSize: "sm",
            },
            cancel: {
                bg: "transparent",
                color: "brand.error",
                border: "1px solid",
                borderColor: "brand.errorSubtle",
                shadow: "none",
                rounded: "full",
                _hover: {
                    bg: "brand.errorSubtle",
                    borderColor: "brand.error",
                },
                height: "40px",
                paddingInline: "2rem !important",
                fontSize: "sm",
            },
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
            surface: {
                bg: "brand.surface",
                color: "brand.textPrimary",
                border: "none",
                rounded: "md",
                height: "34px",
                paddingInline: "1.25rem !important",
                fontSize: "sm",
                fontWeight: "normal",
                shadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(8px)",
                _hover: {
                    bg: "brand.surfaceHover",
                    shadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                    cursor: "pointer",
                },
            },
            subtle: {
                bg: "brand.primarySubtle",
                color: "brand.primary",
                border: "none",
                borderLeft: "2px solid",
                borderLeftColor: "brand.primary",
                rounded: "md",
                height: "34px",
                paddingInline: "1.25rem !important",
                fontSize: "sm",
                fontWeight: "medium",
                shadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(8px)",
                _hover: {
                    bg: "brand.surface",
                    color: "brand.textPrimary",
                    cursor: "pointer",
                },
            },
        },
        size: {
            md: {
                px: "8",
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
            minHeight: "100dvh",
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
                    primaryHover: { value: "#0e8286" },
                    textOnPrimary: { value: "#ffffff" },
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
        semanticTokens: {
            colors: {
                brand: {
                    primarySubtle: {
                        value: {
                            _light: "rgba(17, 153, 158, 0.08)",
                            _dark: "rgba(17, 153, 158, 0.12)",
                        },
                    },
                    primaryMuted: {
                        value: {
                            _light: "rgba(17, 153, 158, 0.25)",
                            _dark: "rgba(17, 153, 158, 0.4)",
                        },
                    },
                    bg: {
                        value: {
                            _light: "#f7f9f8",
                            _dark: "#1a2422",
                        },
                    },
                    bgSubtle: {
                        value: {
                            _light: "#eef2f0",
                            _dark: "#1e2b28",
                        },
                    },
                    surface: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.03)",
                            _dark: "rgba(255, 255, 255, 0.06)",
                        },
                    },
                    surfaceHover: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.06)",
                            _dark: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                    surfaceRaised: {
                        value: {
                            _light: "#ffffff",
                            _dark: "rgba(255, 255, 255, 0.08)",
                        },
                    },
                    overlay: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.3)",
                            _dark: "rgba(0, 0, 0, 0.6)",
                        },
                    },
                    textPrimary: {
                        value: {
                            _light: "#1a2422",
                            _dark: "#f0f4f3",
                        },
                    },
                    textSecondary: {
                        value: {
                            _light: "#4a5e5a",
                            _dark: "#a8b5b2",
                        },
                    },
                    textMuted: {
                        value: {
                            _light: "#7a8e8a",
                            _dark: "#6b7d79",
                        },
                    },
                    textOnSurface: {
                        value: {
                            _light: "#2d3e3a",
                            _dark: "#d0d8d6",
                        },
                    },
                    border: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.1)",
                            _dark: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                    borderHover: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.2)",
                            _dark: "rgba(255, 255, 255, 0.2)",
                        },
                    },
                    borderFocus: {
                        value: {
                            _light: "#11999e",
                            _dark: "#11999e",
                        },
                    },
                    error: {
                        value: {
                            _light: "#dc2626",
                            _dark: "#ef4444",
                        },
                    },
                    errorHover: {
                        value: {
                            _light: "#b91c1c",
                            _dark: "#dc2626",
                        },
                    },
                    errorSubtle: {
                        value: {
                            _light: "rgba(220, 38, 38, 0.08)",
                            _dark: "rgba(239, 68, 68, 0.12)",
                        },
                    },
                    success: {
                        value: {
                            _light: "#16a34a",
                            _dark: "#22c55e",
                        },
                    },
                    successSubtle: {
                        value: {
                            _light: "rgba(22, 163, 74, 0.08)",
                            _dark: "rgba(34, 197, 94, 0.12)",
                        },
                    },
                    cardBg: {
                        value: {
                            _light: "#ffffff",
                            _dark: "rgba(255, 255, 255, 0.04)",
                        },
                    },
                    inputBg: {
                        value: {
                            _light: "#ffffff",
                            _dark: "rgba(255, 255, 255, 0.06)",
                        },
                    },
                    inputBorder: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.15)",
                            _dark: "rgba(255, 255, 255, 0.12)",
                        },
                    },
                    divider: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.08)",
                            _dark: "rgba(255, 255, 255, 0.08)",
                        },
                    },
                    like: {
                        value: {
                            _light: "#16a34a",
                            _dark: "#22c55e",
                        },
                    },
                    likeSubtle: {
                        value: {
                            _light: "rgba(22, 163, 74, 0.1)",
                            _dark: "rgba(34, 197, 94, 0.15)",
                        },
                    },
                    dislike: {
                        value: {
                            _light: "#dc2626",
                            _dark: "#ef4444",
                        },
                    },
                    dislikeSubtle: {
                        value: {
                            _light: "rgba(220, 38, 38, 0.1)",
                            _dark: "rgba(239, 68, 68, 0.15)",
                        },
                    },
                    scrollbarThumb: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.15)",
                            _dark: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                    progressTrail: {
                        value: {
                            _light: "rgba(0, 0, 0, 0.08)",
                            _dark: "rgba(255, 255, 255, 0.08)",
                        },
                    },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
