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
            height = "70px",
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
                <Field.Label fontSize="lg" mb={0}>
                    <Flex>
                        <Box>{title}</Box>
                        {required && (
                            <Box color="gpRed.500" pl={1}>
                                *
                            </Box>
                        )}
                    </Flex>
                </Field.Label>
                {allowHelperText && (
                    <Field.HelperText
                        fontSize="sm"
                        py={2}
                        mt={0}
                        color="brand.lightTitle"
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
                        border="1px solid"
                        borderColor="brand.backgroundPrimary"
                        shadow="md"
                        backgroundColor="brand.backgroundTertiaryOpaque"
                        color="white"
                        _focus={{
                            shadow: "xl",
                            borderColor: "brand.primary",
                        }}
                        _invalid={{
                            borderColor: "brand.error",
                        }}
                    />
                </InputGroup>
                {allowErrors && (
                    <Box h="16px" mt="8px">
                        <Field.ErrorText>{error}</Field.ErrorText>
                    </Box>
                )}
            </Field.Root>
        );
    }
);

TextInput.displayName = "TextInput";
