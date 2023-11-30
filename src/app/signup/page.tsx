/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { RegisterUser } from "../../../firebase/utils";
import { TextInput } from "@/components/TextInput";
import {
    Box,
    Button,
    Flex,
    FormErrorMessage,
    IconButton,
} from "@chakra-ui/react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
            password: "",
            confirmPassword: "",
        },
    });

    const performRegister = async (formData: FormData) => {
        setSubmitting(true);
        try {
            RegisterUser(formData.email, formData.password, router);
            setAuthError(null);
        } catch (error) {
            // TODO error not being thrown or caught - FIX
            setAuthError(
                "Error registering. Please check your email and password and try again."
            );
        }
    };

    return (
        <Flex direction="column" w={["100%", "100%", "70%", "60%"]}>
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
