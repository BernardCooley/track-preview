"use client";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    useDisclosure,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { DeleteUser, LogOut } from "../../../firebase/utils";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Props {}

const Settings = ({}: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    const logout = async () => {
        LogOut(router);
    };

    const deleteAccount = async () => {
        try {
            await DeleteUser();
            router.push("/loginRegister?accountDeleted=true");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="brand.backgroundSecondary" mx={10}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Customer
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onClose}
                                variant="cancel"
                            >
                                Cancel
                            </Button>

                            <Button
                                colorScheme="teal"
                                type="button"
                                variant="warning"
                                onClick={async () => {
                                    deleteAccount();
                                    onClose();
                                }}
                                ml={3}
                            >
                                Delete account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Header />
            <Flex
                pt={12}
                direction="column"
                w="100%"
                alignItems="center"
                gap={8}
                justifyContent="center"
            >
                <Button
                    colorScheme="teal"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={logout}
                >
                    Log out
                </Button>
                <Button
                    colorScheme="teal"
                    size="sm"
                    type="button"
                    variant="warning"
                    onClick={onOpen}
                >
                    Delete account
                </Button>
            </Flex>
        </Box>
    );
};

export default Settings;
