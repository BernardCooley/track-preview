import {
    Box,
    Field,
    Flex,
    Input,
    InputGroup,
} from "@chakra-ui/react";
import React, {
    CSSProperties,
    ComponentProps,
    LegacyRef,
    ReactNode,
    forwardRef,
} from "react";

interface Props {
    placeholder?: string;
    height?: string;
    size: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs";
    title?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fieldProps: ComponentProps<"input">;
    required?: boolean;
    styles?: CSSProperties;
    type?: string;
    variant?: string;
    isReadOnly?: boolean;
    allowErrors?: boolean;
    allowHelperText?: boolean;
}

export const TextInput = forwardRef(
    (
        {
            placeholder = "",
            height = "48px",
            size,
            title = "",
            error,
            helperText = "",
            leftIcon,
            rightIcon,
            fieldProps,
            required = false,
            styles = {},
            type = "text",
            variant = "primary",
            isReadOnly = false,
            allowErrors = true,
            allowHelperText = true,
        }: Props,
        ref: LegacyRef<HTMLInputElement>
    ) => {
        return (
            <Field.Root invalid={error ? true : false} style={styles}>
                {title && (
                    <Field.Label
                        fontSize="sm"
                        fontWeight="medium"
                        color="brand.textSecondary"
                        mb={1}
                    >
                        <Flex>
                            <Box>{title}</Box>
                            {required && (
                                <Box color="brand.error" pl={1}>
                                    *
                                </Box>
                            )}
                        </Flex>
                    </Field.Label>
                )}
                {allowHelperText && helperText && (
                    <Field.HelperText
                        fontSize="xs"
                        py={1}
                        mt={0}
                        color="brand.textMuted"
                    >
                        {helperText}
                    </Field.HelperText>
                )}
                <InputGroup
                    startElement={leftIcon}
                    endElement={rightIcon}
                >
                    <Input
                        readOnly={isReadOnly}
                        ref={ref}
                        type={type}
                        placeholder={placeholder}
                        height={height}
                        {...fieldProps}
                        boxSizing="border-box"
                        size={size}
                        aria-label={title}
                        bg="brand.inputBg"
                        border="1px solid"
                        borderColor="brand.inputBorder"
                        rounded="input"
                        color="brand.textPrimary"
                        fontSize="md"
                        transition="all 0.2s ease"
                        _placeholder={{
                            color: "brand.textMuted",
                        }}
                        _focus={{
                            borderColor: "brand.borderFocus",
                            shadow: "0 0 0 1px var(--chakra-colors-brand-border-focus)",
                        }}
                        _invalid={{
                            borderColor: "brand.error",
                            shadow: "0 0 0 1px var(--chakra-colors-brand-error)",
                        }}
                    />
                </InputGroup>
                {allowErrors && (
                    <Box h="16px" mt="6px">
                        <Field.ErrorText fontSize="xs">
                            {error}
                        </Field.ErrorText>
                    </Box>
                )}
            </Field.Root>
        );
    }
);

TextInput.displayName = "TextInput";
