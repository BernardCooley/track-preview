"use client";

import { Flex, IconButton, Link, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    pathname: string;
    linkText: string;
    href: string;
    icon?: React.ReactNode | null;
}

const MenuDrawerItem = ({ pathname, linkText, href, icon }: Props) => {
    return (
        <Link
            transform={pathname === href ? "scale(1.2)" : ""}
            textDecoration={pathname === href ? "underline" : ""}
            _hover={
                pathname !== href
                    ? {
                          bg: "transparent",
                          color: "brand.primary",
                          transform: "scale(1.2)",
                      }
                    : { bg: "transparent" }
            }
            color={pathname === href ? "brand.primary" : "white"}
            variant="primary"
            href={pathname !== href ? href : undefined}
        >
            <Flex alignItems="center">
                <Text textDecoration={pathname === href ? "underline" : ""}>
                    {linkText}
                </Text>
                {icon && (
                    <IconButton
                        color="inherit"
                        height="30px"
                        variant="ghost"
                        aria-label={linkText}
                        fontSize="2xl"
                        icon={<>{icon}</>}
                    />
                )}
            </Flex>
        </Link>
    );
};

export default MenuDrawerItem;
