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
            primaryOpaque: "rgba(16, 152, 157, 0.47)",
            primaryLight: "#16c6cc",
            textPrimary: "#FFFFFF",
            textPrimaryLight: "#b7c0c2",
            backgroundPrimary: "#293533",
            backgroundSecondary: "#40514e",
            backgroundTertiary: "#576d69",
            backgroundTertiaryOpaque: "rgba(86, 108, 104, 0.46)",
            backgroundTertiaryOpaque2: "rgba(86, 108, 104, 0.15)",
            backgroundLightPrimary: "#d6dbdc",
            backgroundLightSecondary: "brand.textPrimary",
            error: "#ff0000",
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
                cursor: "pointer",
                fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                height: "50px",
                size: "lg",
                shadow: "md",
            },
            variants: {
                outlined: {
                    border: "initial",
                },
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
                secondary: {
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
                    _hover: {
                        transform: "scale(1.3)",
                    },
                    color: "brand.primary",
                    padding: "0",
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
                        _invalid: {
                            borderColor: "brand.error",
                        },
                    },
                },
            },
        },
        Textarea: {
            variants: {
                primary: {
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
                    _invalid: {
                        borderColor: "brand.error",
                    },
                },
            },
        },
        Stepper: {
            variants: {
                primary: {
                    step: {
                        button: {
                            _active: {
                                border: "1px solid",
                                borderColor: "brand.primary",
                                bg: "brand.backgroundTertiary",
                            },
                            _hover: {
                                bg: "brand.backgroundTertiary",
                            },
                            shadow: "none",
                        },
                    },
                    description: {
                        color: "brand.backgroundLightPrimary",
                    },
                    indicator: {
                        borderColor: "brand.backgroundTertiary",
                        _hover: {
                            borderColor: "brand.primary",
                        },
                    },
                    separator: {
                        bg: "brand.backgroundTertiary",
                    },
                    number: {
                        color: "brand.backgroundLightPrimary",
                    },
                },
            },
        },
        Select: {
            variants: {
                outline: {
                    field: {
                        height: "50px",
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
        Tag: {
            variants: {
                filter: {
                    container: {
                        padding: "18px",
                        height: "32px",
                        border: "1px solid",
                        borderColor: "brand.primary",
                        backgroundColor: "brand.backgroundTertiary",
                        _hover: {
                            shadow: "xl",
                            border: "1px solid",
                            borderColor: "brand.primaryLight",
                            bg: "brand.primaryOpaque",
                            cursor: "pointer",
                        },
                        _active: {
                            shadow: "xl",
                            border: "1px solid",
                            borderColor: "brand.primaryLight",
                            bg: "brand.primaryOpaque",
                        },
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "normal",
                        rounded: "full",
                        userSelect: "none",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        bg: "brand.backgroundTertiaryOpaque",
                    },
                },
                loading: {
                    container: {
                        padding: "18px",
                        height: "62px",
                        backgroundColor: "brand.backgroundTertiary",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "normal",
                        rounded: "10px",
                        userSelect: "none",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        bg: "brand.backgroundTertiaryOpaque",
                        shadow: "lg",
                    },
                },
            },
        },
        Menu: {
            variants: {
                primary: {
                    list: {
                        bg: "brand.backgroundPrimary",
                        color: "brand.textPrimary",
                        padding: "0",
                        border: "1px solid",
                        borderColor: "brand.primary",
                        shadow: "md",
                    },
                    item: {
                        px: 2,
                        fontSize: "lg",
                        rounded: "md",
                        bg: "transparent",
                        color: "brand.textPrimary",
                        _hover: {
                            bg: "brand.backgroundTertiaryOpaque",
                        },
                    },
                },
            },
        },
        Table: {
            variants: {
                primary: {
                    table: {},
                    th: {
                        color: "textPrimaryLight",
                        padding: "10px",
                    },
                    td: {
                        color: "textPrimaryLight",
                        padding: "10px",
                    },
                    tr: {
                        color: "textPrimaryLight",
                        borderBottom: "1px solid",
                        borderBottomColor: "brand.backgroundTertiary",
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
                bgRepeat: "no-repeat",
                height: "100vh",
            },
        }),
    },
});
