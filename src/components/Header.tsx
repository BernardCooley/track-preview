import {
    Divider,
    Flex,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import React, { forwardRef } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuDrawer from "./MenuDrawer";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = forwardRef<HTMLButtonElement | undefined>((menuButtonRef) => {
    const pathname = usePathname();
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <MenuDrawer
                ref={menuButtonRef as any}
                isOpen={isOpen}
                onClose={onClose}
            />
            <IconButton
                _hover={{
                    bg: "transparent",
                    color: "brand.primary",
                    transform: "scale(1.2)",
                }}
                shadow="lg"
                height="30px"
                position="absolute"
                right={6}
                top={12}
                onClick={onOpen}
                variant="ghost"
                h={1 / 2}
                colorScheme="teal"
                aria-label="Show password"
                fontSize="3xl"
                icon={<MenuOpenIcon fontSize="inherit" />}
            />
            <Flex w="full" justifyContent="center" mt={6}>
                <Flex
                    alignItems="center"
                    height="50px"
                    fontSize={["3xl", "5xl"]}
                    fontFamily="brand"
                    backgroundImage={"url(/logo_1x.png)"}
                    backgroundSize="100% 100%"
                    backgroundRepeat="no-repeat"
                >
                    <Link href={pathname !== "/explore" ? "/explore" : ""}>
                        <Text
                            userSelect="none"
                            fontSize="2xl"
                            color="brand.backgroundLightPrimary"
                        >
                            PHONIQUEST
                        </Text>
                    </Link>
                </Flex>
            </Flex>
            <Divider mt={4} />
        </>
    );
});

Header.displayName = "Header";

export default Header;
