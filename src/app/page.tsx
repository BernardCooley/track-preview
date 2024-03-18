"use client";

import {
    Box,
    Button,
    Flex,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tr,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../Contexts/AuthContext";

export default function Home() {
    const { user } = useAuthContext();
    const router = useRouter();
    const listItems = [
        "Listen to a sample of random track based on your selection of genre and release year",
        "Mark each track as liked or disliked",
        "Dislikes are never seen again. Likes are moved to the next step for later review",
        "A new track is loaded after each like or dislike",
    ];

    return (
        <Flex h="full" m={0} px={[4, 8]} direction="column" alignItems="center">
            <Flex
                mt={8}
                mb={4}
                w={["250px", "350px", "550px"]}
                alignItems="center"
                height={["80px", "110px", "140px"]}
                fontSize={["3xl", "4xl", "5xl"]}
                fontFamily="brand"
                backgroundImage={"url(/logo_1x.png)"}
                backgroundSize={["100% 100%"]}
                backgroundRepeat="no-repeat"
            >
                <Text w="full" textAlign="center">
                    PHONIQUEST
                </Text>
            </Flex>
            <Flex
                direction="column"
                alignItems="center"
                gap={10}
                p={6}
                h="full"
                w="full"
            >
                <Text fontSize={["2xl", "3xl"]}>Welcome to Phoniquest</Text>
                <Flex w="full" maxW="500px" pb={20}>
                    <TableContainer
                        w="full"
                        overflow="hidden"
                        sx={{
                            textWrap: "wrap",
                        }}
                    >
                        <Table variant="unstyled">
                            <Tbody>
                                {listItems.map((item) => (
                                    <Tr key={item} h={20}>
                                        <Td pr={4}>
                                            <Box
                                                w="30px"
                                                h="15px"
                                                backgroundImage={
                                                    "url(/logo_1x.png)"
                                                }
                                                backgroundSize="100% 100%"
                                                backgroundRepeat="no-repeat"
                                            ></Box>
                                        </Td>
                                        <Td
                                            fontSize={["lg", "xl"]}
                                            lineHeight={[6, 8]}
                                            p={0}
                                        >
                                            {item}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Flex>
                <Button
                    onClick={() => {
                        router.push(
                            user ? "/explore" : "/loginRegister?login=true"
                        );
                    }}
                    variant="primary"
                >
                    Get Started
                </Button>
            </Flex>
        </Flex>
    );
}
