"use client";
import { deleteComment, getComments } from "@/bff/bff";
import Header from "@/components/Header";
import {
    Box,
    Flex,
    IconButton,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Table,
    TableContainer,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { Comments } from "@prisma/client";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {}

const Contact = ({}: Props) => {
    const [comments, setComments] = useState<Comments[] | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const comms = await getComments();
            if (comms) {
                setComments(comms);
            }
            setDeletingId(null);
        } catch (error) {
            setDeletingId(null);
        }
    };

    const TabContainer = ({ children }: { children: React.ReactNode }) => {
        return (
            <Flex
                direction="column"
                h="100vh"
                justifyContent="space-between"
                alignItems="center"
                w="full"
            >
                {children}
            </Flex>
        );
    };

    const formatDate = (date: Date) => {
        return `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    };

    const removeComment = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteComment({
                id,
            });
            fetchComments();
        } catch (error) {
            setDeletingId(null);
            console.log(error);
        }
    };

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
            {comments && comments.length > 0 ? (
                <Tabs
                    pt={10}
                    defaultIndex={0}
                    isFitted
                    variant="solid-rounded"
                    colorScheme="primary"
                >
                    <TabList px={[10, 16, 60, 80]} gap={2}>
                        <Tab>Comments</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <TabContainer>
                                <TableContainer w="full">
                                    <Table variant="primary" size="lg">
                                        <Thead>
                                            <Tr>
                                                <Th>Name</Th>
                                                <Th>Email</Th>
                                                <Th>Comment</Th>
                                                <Th>Date</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {comments &&
                                                comments.map((comment) => (
                                                    <Tr key={comment.id}>
                                                        <Td
                                                            sx={{
                                                                whiteSpace:
                                                                    "pre-wrap",
                                                                wordWrap:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {comment.name}
                                                        </Td>
                                                        <Td
                                                            sx={{
                                                                whiteSpace:
                                                                    "pre-wrap",
                                                                wordWrap:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {comment.email}
                                                        </Td>
                                                        <Td
                                                            sx={{
                                                                whiteSpace:
                                                                    "pre-wrap",
                                                                wordWrap:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {comment.comment}
                                                        </Td>
                                                        <Td>
                                                            {formatDate(
                                                                new Date(
                                                                    comment.createdAt
                                                                )
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                _hover={{
                                                                    bg: "transparent",
                                                                    color: "brand.primary",
                                                                    transform:
                                                                        "scale(1.2)",
                                                                }}
                                                                shadow="lg"
                                                                height="30px"
                                                                onClick={() =>
                                                                    removeComment(
                                                                        comment.id
                                                                    )
                                                                }
                                                                variant="ghost"
                                                                h={1 / 2}
                                                                colorScheme="teal"
                                                                aria-label="Show password"
                                                                fontSize="3xl"
                                                                icon={
                                                                    deletingId ===
                                                                    comment.id ? (
                                                                        <Spinner
                                                                            color="brand.primary"
                                                                            size="xs"
                                                                        />
                                                                    ) : (
                                                                        <DeleteIcon fontSize="inherit" />
                                                                    )
                                                                }
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </TabContainer>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            ) : (
                <Text mt={20} fontSize="3xl" textAlign="center">
                    No comments
                </Text>
            )}
        </Box>
    );
};

export default Contact;
