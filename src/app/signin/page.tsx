/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { LoginUser } from "../../../firebase/utils";
import { TextInput } from "@/components/TextInput";
import { Button, Flex, IconButton, Link, Text } from "@chakra-ui/react";
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

interface Props {}

const SignIn = ({}: Props) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

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
        const loginResponse = LoginUser(
            formData.email,
            formData.password,
            router
        );
    };

    return (
        <Flex direction="column" h="100vh" justifyContent="space-between">
            <Flex direction="column">
                <Text w="full" textAlign="center" fontSize="4xl" pt={4}>
                    Sign In
                </Text>
                <form
                    onSubmit={handleSubmit(performLogin)}
                    style={{ height: "100%" }}
                >
                    <Flex
                        direction="column"
                        gap="18px"
                        p={20}
                        justifyContent="space-between"
                        height="full"
                    >
                        <Flex direction="column">
                            <TextInput
                                required={true}
                                title="Email"
                                height="40px"
                                size="sm"
                                fieldProps={register("email")}
                                error={errors.email?.message}
                            />
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                required={true}
                                title="Password"
                                height="40px"
                                size="sm"
                                fieldProps={register("password")}
                                error={errors.password?.message}
                                rightIcon={
                                    <IconButton
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
                                colorScheme="teal"
                                isLoading={submitting}
                                size="sm"
                                type="submit"
                                variant="outline"
                                onClick={handleSubmit(performLogin)}
                                _hover={
                                    submitting
                                        ? { backgroundColor: "red" }
                                        : undefined
                                }
                            >
                                Sign In
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Flex>
            <Flex px={20} pb={6} gap={2}>
                <Text>Not registered? </Text>
                <Link fontWeight="bold" onClick={() => router.push("/signup")}>
                    Register here
                </Link>
            </Flex>
        </Flex>
    );
};

export default SignIn;