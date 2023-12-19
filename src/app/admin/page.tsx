"use client";
import { deleteComment, getComments, updateCommentReplied } from "@/bff/bff";
import Header from "@/components/Header";
import {
    Box,
    Checkbox,
    Flex,
    IconButton,
    Link,
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
import ReplyIcon from "@mui/icons-material/Reply";

interface Props {}

const Contact = ({}: Props) => {
    const [comments, setComments] = useState<Comments[] | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            setUpdatingId(null);
        } catch (error) {
            setDeletingId(null);
            setUpdatingId(null);
        }
    };

    const setReplied = async (id: string, replied: boolean) => {
        setUpdatingId(id);
        try {
            await updateCommentReplied({
                id,
                replied,
            });
            fetchComments();
        } catch (error) {
            setUpdatingId(null);
            console.log(error);
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
                                                    <Tr
                                                        opacity={
                                                            deletingId ===
                                                            comment.id
                                                                ? 0.3
                                                                : 1
                                                        }
                                                        key={comment.id}
                                                    >
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
                                                            <Flex
                                                                justifyContent="space-between"
                                                                alignItems="center"
                                                            >
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
                                                                            <Spinner size="xs" />
                                                                        ) : (
                                                                            <DeleteIcon fontSize="inherit" />
                                                                        )
                                                                    }
                                                                />
                                                                <IconButton
                                                                    as={Link}
                                                                    href={`mailto:${comment.email}`}
                                                                    _hover={{
                                                                        bg: "transparent",
                                                                        color: "brand.primary",
                                                                        transform:
                                                                            "scale(1.2)",
                                                                    }}
                                                                    shadow="lg"
                                                                    height="30px"
                                                                    variant="ghost"
                                                                    h={1 / 2}
                                                                    colorScheme="teal"
                                                                    aria-label="Show password"
                                                                    fontSize="3xl"
                                                                    icon={
                                                                        <ReplyIcon fontSize="inherit" />
                                                                    }
                                                                />

                                                                <Checkbox
                                                                    colorScheme="teal"
                                                                    defaultChecked={
                                                                        comment.replied
                                                                    }
                                                                    onChange={() => {
                                                                        setReplied(
                                                                            comment.id,
                                                                            !comment.replied
                                                                        );
                                                                    }}
                                                                >
                                                                    Replied
                                                                </Checkbox>
                                                            </Flex>
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
