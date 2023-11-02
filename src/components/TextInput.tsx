import {
    Box,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
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
    height: string;
    size: string;
    title?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fieldProps: ComponentProps<"input">;
    required?: boolean;
    styles?: CSSProperties;
    type?: string;
}

export const TextInput = forwardRef(
    (
        {
            placeholder = "",
            height,
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
        }: Props,
        ref: LegacyRef<HTMLInputElement>
    ) => {
        return (
            <FormControl isInvalid={error ? true : false} style={styles}>
                <FormLabel fontSize="lg" mb={0}>
                    <Flex>
                        <Box>{title}</Box>
                        {required && (
                            <Box color="gpRed.500" pl={1}>
                                *
                            </Box>
                        )}
                    </Flex>
                </FormLabel>
                <FormHelperText
                    fontSize="sm"
                    py={2}
                    mt={0}
                    color="brand.lightTitle"
                >
                    {helperText}
                </FormHelperText>
                <InputGroup>
                    {leftIcon && (
                        <InputLeftElement>{leftIcon}</InputLeftElement>
                    )}
                    <Input
                        backgroundColor={error ? "red.50" : "white"}
                        variant="outline"
                        colorScheme="teal"
                        ref={ref}
                        type={type}
                        placeholder={placeholder}
                        height={height}
                        {...fieldProps}
                        boxSizing="border-box"
                        size={size}
                        aria-label={title}
                    />
                    {rightIcon && (
                        <InputRightElement>{rightIcon}</InputRightElement>
                    )}
                </InputGroup>
                <Box h="16px" mt="8px">
                    <FormErrorMessage>{error}</FormErrorMessage>
                </Box>
            </FormControl>
        );
    }
);

TextInput.displayName = "TextInput";
