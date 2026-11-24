"use client";

import { Flex, Link, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    pathname: string;
    linkText: string;
    href: string;
    icon?: React.ReactNode | null;
    badge?: React.ReactNode | null;
    onClick?: () => void;
}

const MenuDrawerItem = ({ pathname, linkText, href, icon, badge, onClick }: Props) => {
    const isActive = pathname === href;

    const sharedProps = {
        display: "flex" as const,
        alignItems: "center" as const,
        gap: 2,
        px: 3,
        py: 2,
        rounded: "lg" as const,
        bg: isActive ? "brand.primarySubtle" : "transparent",
        color: isActive ? "brand.primary" : "brand.textSecondary",
        fontWeight: isActive ? "semibold" : "medium",
        fontSize: "md",
        transition: "all 0.2s ease",
        _hover: !isActive
            ? {
                  bg: "brand.surfaceHover",
                  color: "brand.textPrimary",
              }
            : {},
    };

    const content = (
        <>
            <Text>{linkText}</Text>
            {badge}
            {icon && (
                <Flex color="inherit" fontSize="sm">
                    {icon}
                </Flex>
            )}
        </>
    );

    if (onClick) {
        return (
            <Flex {...sharedProps} cursor="pointer" onClick={onClick}>
                {content}
            </Flex>
        );
    }

    return (
        <Link href={!isActive ? href : undefined} {...sharedProps}>
            {content}
        </Link>
    );
};

export default MenuDrawerItem;
