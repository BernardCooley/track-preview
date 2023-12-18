"use client";
import { addComment } from "@/bff/bff";
import Header from "@/components/Header";
import { TextInput } from "@/components/TextInput";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Text,
    Textarea,
    ToastProps,
    useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ZodType, z } from "zod";
import { auth } from "../../../firebase/firebaseInit";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { User } from "../../../types";

interface FormData {
    name: string;
    email: string;
    comment: string;
}

const schema: ZodType<FormData> = z.object({
    name: z.string(),
    email: z.string().email(),
    comment: z
        .string()
        .min(6, { message: "Comment must be more than 6 characters." }),
});

interface Props {}

const Contact = ({}: Props) => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const toast = useToast();
    const id = "loginToast";
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            comment: "",
        },
    });

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

    const isUserLoggedIn = useCallback(async () => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                setValue("email", user.email);
                setUser({ email: user.email, uid: user.uid });
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    const sendComment = async (data: FormData) => {
        setSubmitting(true);

        if (user?.uid) {
            try {
                await addComment({
                    name: data.name,
                    email: data.email,
                    comment: data.comment,
                    userId: user?.uid,
                });
            } catch (error) {
                showToast({
                    status: "error",
                });
            }
        } else {
            showToast({
                status: "error",
            });
        }

        setSubmitting(false);
        setSuccess(true);
    };

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
            {success ? (
                <Flex
                    direction="column"
                    alignItems="center"
                    h="full"
                    gap={14}
                    pt={20}
                    px={6}
                >
                    <Text fontSize="2xl" textAlign="center">
                        Thank you for your comment!
                    </Text>
                    <Text fontSize="lg" textAlign="center">
                        We will get back you as sopon as possible.
                    </Text>
                    <Button
                        onClick={() => router.push("/explore")}
                        variant="primary"
                    >
                        Back to the music
                    </Button>
                </Flex>
            ) : (
                <Flex w="full" justifyContent="center">
                    <Box w={["100%", "100%", "70%", "60%"]}>
                        <form
                            onSubmit={handleSubmit(sendComment)}
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
                                <Flex
                                    direction="column"
                                    gap={8}
                                    alignItems="center"
                                >
                                    <TextInput
                                        required={false}
                                        title="Name"
                                        size="md"
                                        fieldProps={register("name")}
                                        error={errors.name?.message}
                                    />
                                    <TextInput
                                        required={true}
                                        title="Email"
                                        size="md"
                                        fieldProps={register("email")}
                                        error={errors.email?.message}
                                    />
                                    <FormControl>
                                        <FormLabel fontSize="lg" mb={3}>
                                            <Flex>
                                                <Box>Comment</Box>
                                                <Box color="gpRed.500" pl={1}>
                                                    *
                                                </Box>
                                            </Flex>
                                        </FormLabel>
                                        <Controller
                                            name="comment"
                                            control={control}
                                            defaultValue=""
                                            render={({ field }) => (
                                                <Textarea
                                                    variant="primary"
                                                    {...field}
                                                    resize="vertical"
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    {/* <TextAreaInput
                                        required={true}
                                        title="Comment"
                                        size="md"
                                        fieldProps={register("comment")}
                                        error={errors.comment?.message}
                                    /> */}
                                    <Button
                                        w="200px"
                                        isLoading={submitting}
                                        type="submit"
                                        variant="primary"
                                        onClick={handleSubmit(sendComment)}
                                    >
                                        Send comment
                                    </Button>
                                </Flex>
                            </Flex>
                        </form>
                    </Box>
                </Flex>
            )}
        </Box>
    );
};

export default Contact;
