/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
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
    Text,
    VStack,
} from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { UserCredential } from "firebase/auth";
import {
    LinkAnonymousAccount,
    RegisterUser,
} from "../../firebase/utils";
import { createUser, mutateUserProfile, sendVerificationEmail } from "@/bff/bff";
import { auth } from "../../firebase/firebaseInit";

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
}

const schema: ZodType<FormData> = z
    .object({
        email: z.string().email(),
        password: z
            .string()
            .min(6, { message: "Password must be 6 characters or more." }),
        confirmPassword: z
            .string()
            .min(6, { message: "Password must be 6 characters or more." }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const SignUp = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const id = "registerToast";
    const [email, setEmail] = useState("");

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
            confirmPassword: "",
        },
    });

    const performRegister = async (formData: FormData) => {
        setEmail(formData.email);
        setSubmitting(true);
        setAuthError(null);
        const isCurrentlyAnonymous = auth.currentUser?.isAnonymous === true;
        let newUser: UserCredential | null = null;

        try {
            if (isCurrentlyAnonymous) {
                newUser = await LinkAnonymousAccount(formData.email, formData.password);
            } else {
                newUser = await RegisterUser(formData.email, formData.password);
            }
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use" || error.code === "auth/credential-already-in-use") {
                setAuthError("This email is already registered. Please sign in instead.");
            } else {
                setAuthError("Error registering. Please check your email and password and try again.");
            }
            setSubmitting(false);
            return;
        }

        if (!newUser) {
            setAuthError("Error registering. Please try again.");
            setSubmitting(false);
            return;
        }

        if (isCurrentlyAnonymous) {
            try {
                await mutateUserProfile({
                    userId: newUser.user.uid,
                    isAnonymous: false,
                });
            } catch (error) {
                setAuthError("Account was linked but profile update failed. Please sign in with your new email.");
                setSubmitting(false);
                return;
            }
        } else {
            try {
                await createUser({
                    userId: newUser.user.uid,
                });
            } catch (error) {
                try {
                    await newUser.user.delete();
                } catch {}
                setAuthError("Error creating your account. Please try again.");
                setSubmitting(false);
                return;
            }
        }

        try {
            await sendVerificationEmail(newUser.user.email!);
        } catch (error) {
            showToast({
                title: "Verification email failed to send.",
                description: "Your account was created. Please try signing in — you can request a new verification email.",
                type: "warning",
            });
        }

        setAuthError(null);
        setSubmitted(true);
        setSubmitting(false);
    };

    const PasswordToggle = (
        <IconButton
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            variant="tertiary"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label="Toggle password visibility"
            color="brand.textMuted"
        >
            {showPassword ? (
                <VisibilityIcon fontSize="small" />
            ) : (
                <VisibilityOffIcon fontSize="small" />
            )}
        </IconButton>
    );

    return (
        <Flex direction="column" w="full" maxW="420px" mx="auto">
            {!submitted ? (
                <form onSubmit={handleSubmit(performRegister)}>
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
                            rightIcon={PasswordToggle}
                        />
                        <TextInput
                            type={showPassword ? "text" : "password"}
                            required={true}
                            title="Confirm password"
                            size="md"
                            fieldProps={register("confirmPassword")}
                            error={errors.confirmPassword?.message}
                            rightIcon={PasswordToggle}
                        />
                        <Button
                            loading={submitting}
                            type="submit"
                            variant="primary"
                            w="full"
                            onClick={handleSubmit(performRegister)}
                        >
                            Register
                        </Button>
                    </Flex>
                </form>
            ) : (
                <VStack gap={6} py={12} px={6} textAlign="center">
                    <Box
                        w="64px"
                        h="64px"
                        rounded="full"
                        bg="brand.successSubtle"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="brand.success"
                        fontSize="2xl"
                    >
                        ✓
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color="brand.textPrimary">
                        Registration successful
                    </Text>
                    <Text fontSize="md" color="brand.textSecondary" maxW="320px">
                        A confirmation email has been sent to{" "}
                        <strong>{email}</strong>. Please verify your email and then you can log in.
                    </Text>
                </VStack>
            )}
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

export default SignUp;
