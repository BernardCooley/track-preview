import {
    Box,
    Flex,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import React, { useCallback, useEffect } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuDrawer from "./MenuDrawer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import { GetCurrentUser } from "../../firebase/utils";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getUserProfile } from "@/bff/bff";
import { toaster } from "@/components/toaster";

const Header = () => {
    const pathname = usePathname();
    const { open: isOpen, onOpen, onClose } = useDisclosure();
    const { user, updateUser, updateUserProfile, setProfileError } = useAuthContext();

    useEffect(() => {
        if (user?.uid) {
            (async () => {
                try {
                    setProfileError(false);
                    const userProf = await getUserProfile({ userId: user.uid });
                    updateUserProfile(userProf);
                } catch {
                    setProfileError(true);
                    toaster.create({
                        title: "Unable to load your profile",
                        description: "Some features may be unavailable. Please try again later.",
                        type: "error",
                        duration: 8000,
                    });
                }
            })();
        }
    }, [user]);

    const initAuth = useCallback(async () => {
        const currentUser = await GetCurrentUser();
        if (currentUser?.email && currentUser?.uid) {
            updateUser({ email: currentUser.email, uid: currentUser.uid });
        }
        onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser?.email && firebaseUser?.uid) {
                updateUser({ email: firebaseUser.email, uid: firebaseUser.uid });
            }
        });
    }, []);

    useEffect(() => {
        if (!user) {
            initAuth();
        }
    }, [user, initAuth]);

    return (
        <>
            <MenuDrawer isOpen={isOpen} onClose={onClose} />
            <Box
                w="full"
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                bg="brand.bg"
                position="sticky"
                top={0}
                zIndex={100}
            >
            <Flex
                maxW={["none", "none", "none", "1000px"]}
                mx="auto"
                justifyContent="space-between"
                alignItems="center"
                px={[3, 4]}
                py={1}
            >
                <Link href={pathname !== "/explore" ? "/explore" : ""}>
                    <Text
                        userSelect="none"
                        fontSize="md"
                        fontFamily="brand"
                        color="brand.textPrimary"
                        letterSpacing="wide"
                        _hover={{
                            color: "brand.primary",
                        }}
                        transition="color 0.2s ease"
                    >
                        PHONIQUEST
                    </Text>
                </Link>
                <IconButton
                    variant="tertiary"
                    onClick={onOpen}
                    aria-label="Open menu"
                    color="brand.textSecondary"
                >
                    <MenuOpenIcon fontSize="small" />
                </IconButton>
            </Flex>
            </Box>
        </>
    );
};

export default Header;
