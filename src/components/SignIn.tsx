/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { TextInput } from "@/components/TextInput";
import {
    Box,
    Button,
    Field,
    Flex,
    IconButton,
    Link,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LoginUser } from "../../firebase/utils";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import { useLocalStorage } from "usehooks-ts";

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
    const [_, setHasPreviouslyLoggedIn] = useLocalStorage<boolean>(
        "has-previously-logged-in",
        false
    );
    const searchParams = useSearchParams();
    const isAttemptingAccountEdit = searchParams.get("isAttemptingAccountEdit");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const id = "loginToast";

    const showToast = useCallback(
        ({ type, title, description }: { type?: string; title?: string; description?: string }) => {
            toaster.create({
                id,
                title: title || "An error has occured.",
                description: description || "Please try again later.",
                type: (type as "success" | "error" | "warning" | "info") || "error",
                duration: 5000,
            });
        },
        []
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
                    router.push("/explore");
                }
                setAuthError(null);
                setHasPreviouslyLoggedIn(true);
            } else {
                await signOut(auth);
                setAuthError(
                    "Your email address has not been verified. Please check your inbox for a verification link and then you can log in."
                );
            }
            setSubmitting(false);
        } catch (error) {
            showToast({
                title: "Error signing in.",
                description:
                    "Please check your email and password and try again.",
                type: "error",
            });

            setTimeout(() => {
                setSubmitting(false);
            }, 5000);

            setAuthError(
                "Error signing in. Please check your email and password and try again."
            );
        }
    };

    return (
        <Flex direction="column" w="full" maxW="420px" mx="auto">
            <form
                onSubmit={handleSubmit(performLogin)}
                style={{ height: "100%" }}
            >
                <Flex
                    direction="column"
                    gap={5}
                    p={[5, 6]}
                >
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
                                position="absolute"
                                right={2}
                                top="50%"
                                transform="translateY(-50%)"
                                variant="tertiary"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                aria-label="Toggle password visibility"
                                color="brand.textMuted"
                            >
                                {showPassword ? (
                                    <VisibilityIcon fontSize="small" />
                                ) : (
                                    <VisibilityOffIcon fontSize="small" />
                                )}
                            </IconButton>
                        }
                    />
                    <Button
                        loading={submitting}
                        type="submit"
                        variant="primary"
                        w="full"
                        onClick={handleSubmit(performLogin)}
                    >
                        Sign In
                    </Button>
                    <Link
                        href="/resetPassword"
                        variant="primary"
                        fontSize="sm"
                    >
                        Forgot password?
                    </Link>
                </Flex>
            </form>
            {authError && (
                <Box px={[5, 6]}>
                    <Field.Root invalid>
                        <Field.ErrorText fontSize="sm">
                            {authError}
                        </Field.ErrorText>
                    </Field.Root>
                </Box>
            )}
        </Flex>
    );
};

export default SignIn;
