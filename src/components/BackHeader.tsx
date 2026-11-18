"use client";

import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface Props {
    title: string;
}

const BackHeader = ({ title }: Props) => {
    const router = useRouter();

    return (
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
                alignItems="center"
                px={[3, 4]}
                py={1}
            >
                <IconButton
                    variant="tertiary"
                    onClick={() => router.back()}
                    aria-label="Go back"
                    color="brand.textSecondary"
                >
                    <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Text
                    fontSize="md"
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wide"
                >
                    {title}
                </Text>
            </Flex>
        </Box>
    );
};

export default BackHeader;
