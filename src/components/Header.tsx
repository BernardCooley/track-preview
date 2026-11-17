import {
    Flex,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuDrawer from "./MenuDrawer";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();
    const { open: isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <MenuDrawer isOpen={isOpen} onClose={onClose} />
            <Flex
                w="full"
                justifyContent="space-between"
                alignItems="center"
                px={[4, 6]}
                py={3}
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                bg="brand.bg"
                position="sticky"
                top={0}
                zIndex={100}
            >
                <Link href={pathname !== "/explore" ? "/explore" : ""}>
                    <Text
                        userSelect="none"
                        fontSize={["lg", "xl"]}
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
        </>
    );
};

export default Header;
