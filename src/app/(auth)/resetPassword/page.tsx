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
            router.push("/loginRegister?passwordReset=true");
        } catch (error) {
            // TODO error not being thrown or caught - FIX
            setAuthError(
                "Error sending password reset email. Please check your email and password and try again."
            );
        }
    };

    return (
        <Box
            backgroundImage={"url(/logo_background_4x.png)"}
            backgroundSize="90%"
            backgroundRepeat="no-repeat"
            backgroundPosition="center 300px"
            padding={4}
            height="100vh"
        >
            <IconButton
                _hover={{
                    bg: "transparent",
                    color: "brand.primary",
                    transform: "scale(1.2)",
                }}
                shadow="lg"
                height="30px"
                position="absolute"
                left={6}
                top={12}
                onClick={() => router.push("/loginRegister")}
                variant="ghost"
                h={1 / 2}
                colorScheme="teal"
                aria-label="Show password"
                fontSize="3xl"
                icon={<ArrowBackIosNewIcon fontSize="inherit" />}
            />
            <Text
                py={10}
                textAlign="center"
                fontSize={["3xl", "6xl"]}
                fontFamily="brand"
            >
                PHONIQUEST
            </Text>
            <Flex direction="column" w={["100%", "100%", "70%", "60%"]}>
                <form
                    onSubmit={handleSubmit(performPasswordReset)}
                    style={{ height: "100%" }}
                >
                    <Flex
                        direction="column"
                        gap="18px"
                        p={[6, 12, 20]}
                        pt={10}
                        justifyContent="space-between"
                        height="full"
                    >
                        <Flex direction="column" gap={8}>
                            <TextInput
                                required={true}
                                title="Email"
                                size="md"
                                fieldProps={register("email")}
                                error={errors.email?.message}
                            />
                            <Button
                                isLoading={submitting}
                                type="submit"
                                variant="primary"
                                onClick={handleSubmit(performPasswordReset)}
                            >
                                Reset password
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Flex>
        </Box>
    );
};

export default PasswordReset;
