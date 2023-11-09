import { Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";

interface Props {
    settingsOpen: boolean;
    filtersToApply: boolean;
    onSetSettingsOpen: () => void;
}

const ApplyFiltersButton = ({
    settingsOpen,
    filtersToApply,
    onSetSettingsOpen,
}: Props) => {
    return (
        <IconButton
            backgroundColor={settingsOpen ? "gray.500" : "white"}
            height="40px"
            width={settingsOpen && filtersToApply ? "160px" : "40px"}
            transition="width 200ms"
            onClick={() => onSetSettingsOpen()}
            aria-label="Apply filters"
            _hover={{
                backgroundColor: settingsOpen ? "none" : "gray.300",
            }}
            icon={
                !settingsOpen || !filtersToApply ? (
                    <SettingsIcon
                        fontSize="inherit"
                        sx={{
                            color: "gray.500",
                        }}
                    />
                ) : (
                    <Flex gap={2} alignItems="center">
                        <Text color="gray.100">Apply & search</Text>
                        <CheckIcon
                            fontSize="inherit"
                            sx={{
                                color: "white",
                            }}
                        />
                    </Flex>
                )
            }
        />
    );
};

export default ApplyFiltersButton;
