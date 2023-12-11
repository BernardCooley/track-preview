/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { LoginUser } from "../../../firebase/utils";
import { TextInput } from "@/components/TextInput";
import {
    Box,
    Button,
    Flex,
    FormErrorMessage,
    IconButton,
    Link,
    Text,
    ToastProps,
    useToast,
} from "@chakra-ui/react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface FormData {
    email: string;
    password: string;
}

const schema: ZodType<FormData> = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(6, { message: "Password must be 6 characters or more." }),
});

const SignIn = () => {
    const searchParams = useSearchParams();
    const isAttemptingAccountEdit = searchParams.get("isAttemptingAccountEdit");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const toast = useToast();
    const id = "loginToast";

    const showToast = useCallback(
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const performLogin = async (formData: FormData) => {
        setSubmitting(true);
        try {
            const user = await LoginUser(formData.email, formData.password);

            if (user?.user.emailVerified) {
                if (isAttemptingAccountEdit === "true") {
                    router.push("/account");
                } else {
                    router.push("/");
                }
            } else {
                showToast({
                    status: "error",
                    title: "Email not verified",
                    description:
                        "Please check your email to verify your account.",
                });
            }
            setSubmitting(false);
            setAuthError(null);
        } catch (error) {
            showToast({
                title: "Error signing in.",
                description:
                    "Please check your email and password and try again.",
                status: "error",
            });

            setTimeout(() => {
                setSubmitting(false);
            }, 5000);

            // TODO error not being thrown or caught - FIX
            setAuthError(
                "Error signing in. Please check your email and password and try again."
            );
        }
    };

    return (
        <Flex direction="column" w={["100%", "100%", "70%", "60%"]}>
            <form
                onSubmit={handleSubmit(performLogin)}
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
                        <TextInput
                            type={showPassword ? "text" : "password"}
                            required={true}
                            title="Password"
                            size="md"
                            fieldProps={register("password")}
                            error={errors.password?.message}
                            rightIcon={
                                <IconButton
                                    _hover={{
                                        bg: "transparent",
                                        color: "brand.primary",
                                        transform: "scale(1.2)",
                                    }}
                                    shadow="lg"
                                    height="30px"
                                    position="absolute"
                                    right={2}
                                    top={8}
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    variant="ghost"
                                    h={1 / 2}
                                    colorScheme="teal"
                                    aria-label="Show password"
                                    fontSize="3xl"
                                    icon={
                                        showPassword ? (
                                            <VisibilityIcon fontSize="inherit" />
                                        ) : (
                                            <VisibilityOffIcon fontSize="inherit" />
                                        )
                                    }
                                />
                            }
                        />
                        <Button
                            isLoading={submitting}
                            type="submit"
                            variant="primary"
                            onClick={handleSubmit(performLogin)}
                        >
                            Sign In
                        </Button>
                        <Flex gap={2}>
                            <Link
                                href="/resetPassword"
                                variant="link"
                                colorScheme="primary"
                            >
                                <Text>Forgot password</Text>
                            </Link>
                        </Flex>
                    </Flex>
                </Flex>
            </form>
            {/* TODO - add forgot password link
                TODO - Message not showing up */}
            {authError && (
                <Box h="16px" mt="8px">
                    <FormErrorMessage>{authError}</FormErrorMessage>
                </Box>
            )}
        </Flex>
    );
};

export default SignIn;
