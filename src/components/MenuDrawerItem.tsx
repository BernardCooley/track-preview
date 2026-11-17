"use client";

import { Flex, Link, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    pathname: string;
    linkText: string;
    href: string;
    icon?: React.ReactNode | null;
}

const MenuDrawerItem = ({ pathname, linkText, href, icon }: Props) => {
    const isActive = pathname === href;

    return (
        <Link
            href={!isActive ? href : undefined}
            display="flex"
            alignItems="center"
            gap={2}
            px={3}
            py={2}
            rounded="lg"
            bg={isActive ? "brand.primarySubtle" : "transparent"}
            color={isActive ? "brand.primary" : "brand.textSecondary"}
            fontWeight={isActive ? "semibold" : "medium"}
            fontSize="md"
            transition="all 0.2s ease"
            _hover={
                !isActive
                    ? {
                          bg: "brand.surfaceHover",
                          color: "brand.textPrimary",
                      }
                    : {}
            }
        >
            <Text>{linkText}</Text>
            {icon && (
                <Flex color="inherit" fontSize="sm">
                    {icon}
                </Flex>
            )}
        </Link>
    );
};

export default MenuDrawerItem;
