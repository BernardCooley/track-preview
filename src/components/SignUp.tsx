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
    Flex,
    FormErrorMessage,
    IconButton,
    ToastProps,
    useToast,
    Text,
} from "@chakra-ui/react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { UserCredential } from "firebase/auth";
import {
    DeleteUser,
    RegisterUser,
    SendVerificationEmail,
} from "../../firebase/utils";
import { createUser } from "@/bff/bff";

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
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const toast = useToast();
    const id = "registerToast";
    const [email, setEmail] = useState("bernardcooley@gmail.com");

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
            confirmPassword: "",
        },
    });

    const performRegister = async (formData: FormData) => {
        setEmail(formData.email);
        setSubmitting(true);
        let newUser: UserCredential | null = null;

        try {
            newUser = await RegisterUser(formData.email, formData.password);
        } catch (error) {
            showToast({
                title: "Error registering.",
                description:
                    "Please check your email and password and try again.",
                status: "error",
            });
            setAuthError(
                "Error registering. Please check your email and password and try again."
            );
        }

        if (newUser) {
            try {
                await createUser({
                    userId: newUser.user.uid,
                });
            } catch (error) {
                await DeleteUser();
                showToast({
                    title: "Error registering.",
                    description:
                        "Please check your email and password and try again.",
                    status: "error",
                });
            }

            try {
                await SendVerificationEmail(newUser.user);

                setAuthError(null);
                setSubmitted(true);
            } catch (error) {
                showToast({
                    title: "Error sending verification email.",
                    description:
                        "Please check your email and password and try again.",
                    status: "error",
                });
            }
        }
        setSubmitting(false);
    };

    return (
        <Flex direction="column" w={["100%", "100%", "70%", "60%"]}>
            {!submitted ? (
                <form onSubmit={handleSubmit(performRegister)}>
                    <Flex
                        direction="column"
                        gap="18px"
                        p={[6, 12, 20]}
                        pt={10}
                        justifyContent="space-between"
                    >
                        <Flex direction="column" gap={8}>
                            <TextInput
                                required={true}
                                title="Email"
                                size="lg"
                                fieldProps={register("email")}
                                error={errors.email?.message}
                            />
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                required={true}
                                title="Password"
                                size="lg"
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
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                required={true}
                                title="Confirm password"
                                size="lg"
                                fieldProps={register("confirmPassword")}
                                error={errors.confirmPassword?.message}
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
                                onClick={handleSubmit(performRegister)}
                            >
                                Register
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            ) : (
                <Flex direction="column" alignItems="center" gap={10} pt={20}>
                    <Text textAlign="center" fontSize="2xl">
                        Registration successful
                    </Text>
                    <Text w="80%" textAlign="center" fontSize="lg">
                        A confirmation email has been sent to{" "}
                        <strong>{email}</strong>.
                    </Text>
                    <Text w="80%" textAlign="center" fontSize="lg">
                        Please check your email to verify your new account.
                    </Text>
                </Flex>
            )}
            {/* TODO - Message not showing up */}
            {authError && (
                <Box h="16px" mt="8px">
                    <FormErrorMessage>{authError}</FormErrorMessage>
                </Box>
            )}
        </Flex>
    );
};

export default SignUp;
