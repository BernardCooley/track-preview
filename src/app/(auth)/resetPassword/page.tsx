"use client";

import { TextInput } from "@/components/TextInput";
import { Box, Button, Field, Flex, IconButton, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ZodType, z } from "zod";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { sendPasswordResetEmail } from "@/bff/bff";

interface Props {}

interface FormData {
    email: string;
}

const schema: ZodType<FormData> = z.object({
    email: z.string().email(),
});

const PasswordReset = ({}: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const performPasswordReset = async (formData: FormData) => {
        setSubmitting(true);
        try {
            await sendPasswordResetEmail(formData.email);
            setAuthError(null);
            setEmailSent(true);
        } catch (error) {
            setAuthError(
                "Error sending password reset email. Please check your email and try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Flex
            h="100dvh"
            direction="column"
            alignItems="center"
            px={[4, 6]}
        >
            <Flex w="full" maxW="480px" pt={[6, 8]}>
                <IconButton
                    variant="tertiary"
                    onClick={() => router.push("/loginRegister?login=true")}
                    aria-label="Back to login"
                    color="brand.textSecondary"
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
            </Flex>

            <Flex
                pt={[4, 6]}
                pb={[4, 6]}
                justifyContent="center"
            >
                <Text
                    fontSize={["3xl", "4xl", "5xl"]}
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wider"
                >
                    PHONIQUEST
                </Text>
            </Flex>

            <Box
                w="full"
                maxW="480px"
                flex={1}
                bg="brand.cardBg"
                border="1px solid"
                borderColor="brand.border"
                roundedTop="card"
                roundedBottom="none"
                p={[5, 6]}
            >
                {emailSent ? (
                    <Flex direction="column" alignItems="center" textAlign="center" gap={4} py={6}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: "var(--chakra-colors-brand-primary)" }} />
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                        >
                            Check your email
                        </Text>
                        <Text fontSize="sm" color="brand.textSecondary">
                            We&apos;ve sent a password reset link to{" "}
                            <Text as="span" fontWeight="semibold" color="brand.textPrimary">
                                {getValues("email")}
                            </Text>
                            . It may take a few minutes to arrive.
                        </Text>
                        <Text fontSize="xs" color="brand.textMuted">
                            Didn&apos;t receive it? Check your spam folder or try again.
                        </Text>
                        <Flex direction="column" gap={3} w="full" mt={2}>
                            <Button
                                variant="primary"
                                w="full"
                                onClick={() => router.push("/loginRegister?login=true")}
                            >
                                Back to sign in
                            </Button>
                            <Button
                                variant="outline"
                                w="full"
                                onClick={() => {
                                    setEmailSent(false);
                                    setAuthError(null);
                                }}
                            >
                                Try a different email
                            </Button>
                        </Flex>
                    </Flex>
                ) : (
                    <>
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            mb={6}
                        >
                            Reset password
                        </Text>

                        <form
                            onSubmit={handleSubmit(performPasswordReset)}
                            style={{ height: "100%" }}
                        >
                            <Flex direction="column" gap={5}>
                                <TextInput
                                    helperText="Enter your email address and we'll send you a link to reset your password."
                                    required={true}
                                    title="Email"
                                    size="md"
                                    fieldProps={register("email")}
                                    error={errors.email?.message}
                                />
                                <Button
                                    loading={submitting}
                                    type="submit"
                                    variant="primary"
                                    w="full"
                                    onClick={handleSubmit(performPasswordReset)}
                                >
                                    Reset password
                                </Button>
                            </Flex>
                        </form>
                        {authError && (
                            <Box mt={4}>
                                <Field.Root invalid>
                                    <Field.ErrorText fontSize="sm">
                                        {authError}
                                    </Field.ErrorText>
                                </Field.Root>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Flex>
    );
};

export default PasswordReset;
