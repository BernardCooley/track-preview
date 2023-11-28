"use client";

import { Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
    pathname: string;
    linkText: string;
    href: string;
}

const MenuDrawerItem = ({ pathname, linkText, href }: Props) => {
    const router = useRouter();

    return (
        <Button
            textUnderlineOffset={4}
            textDecoration={pathname === href ? "underline" : ""}
            _hover={
                pathname !== href
                    ? {
                          bg: "transparent",
                          color: "brand.primary",
                          transform: "scale(1.2)",
                      }
                    : {}
            }
            fontSize="xl"
            shadow="none"
            color={pathname === href ? "brand.primary" : "white"}
            variant="unstyled"
            onClick={() => {
                if (pathname !== href) {
                    router.push(href);
                }
            }}
        >
            <Text textDecoration={pathname === href ? "underline" : ""}>
                {linkText}
            </Text>
        </Button>
    );
};

export default MenuDrawerItem;
