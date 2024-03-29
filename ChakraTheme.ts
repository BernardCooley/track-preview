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
            textPrimaryLighter: "#809093",
            textSecondary: "#383838",
            backgroundPrimary: "#293533",
            backgroundSecondary: "#40514e",
            backgroundTertiary: "#576d69",
            backgroundTertiaryOpaque: "rgba(86, 108, 104, 0.46)",
            backgroundTertiaryOpaque2: "rgba(86, 108, 104, 0.15)",
            backgroundTertiaryOpaque3: "rgba(86, 108, 104, 0.80)",
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
                "tab selected": {
                    _hover: {
                        shadow: "xl",
                    },
                    color: "brand.textPrimary",
                    shadow: "none",
                    rounded: "none",
                },
                "tab deselected": {
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
            },
        },
        Link: {
            variants: {
                primary: {
                    color: "brand.primary",
                    fontWeight: "bold",
                    _hover: {
                        color: "brand.primaryLight",
                    },
                    fontSize: "xl",
                    textUnderlineOffset: 6,
                    textAlign: "center",
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
        Tabs: {
            variants: {
                "solid-rounded": {
                    tablist: {
                        borderBottom: "1px solid",
                        borderColor: "brand.primary",
                    },
                    tab: {
                        color: "brand.textPrimaryLighter",
                        borderBottomRadius: "0px",
                        borderTopRadius: "14px",
                        _selected: {
                            bg: "brand.primary",
                            color: "brand.textPrimary",
                        },
                    },
                },
            },
        },
        Tag: {
            variants: {
                filter: {
                    container: {
                        width: "full",
                        paddingY: "6px",
                        paddingX: "10px",
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
                        fontSize: "14px",
                        fontWeight: "normal",
                        rounded: "full",
                        userSelect: "none",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        bg: "brand.backgroundTertiaryOpaque",
                    },
                    label: {
                        width: "full",
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
                        p: 3,
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
                        paddingLeft: "0",
                        paddingRight: "0",
                    },
                    td: {
                        color: "textPrimaryLight",
                        padding: "10px",
                        paddingLeft: "0",
                        paddingRight: "0",
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
