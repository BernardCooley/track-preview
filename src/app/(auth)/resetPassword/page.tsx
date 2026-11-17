"use client";

import { TextInput } from "@/components/TextInput";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ZodType, z } from "zod";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { ResetPassword } from "../../../../firebase/utils";

interface Props {}

interface FormData {
    email: string;
}

const schema: ZodType<FormData> = z.object({
    email: z.string().email(),
});

const PasswordReset = ({}: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const performPasswordReset = async (formData: FormData) => {
        setSubmitting(true);
        try {
            await ResetPassword(formData.email);
            setAuthError(null);
            setSubmitting(false);
            router.push("/loginRegister?login=true?passwordReset=true");
        } catch (error) {
            setAuthError(
                "Error sending password reset email. Please check your email and password and try again."
            );
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
            </Box>
        </Flex>
    );
};

export default PasswordReset;
