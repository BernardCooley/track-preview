"use client";

import {
    Box,
    Button,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderMark,
    RangeSliderThumb,
    RangeSliderTrack,
    Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { YearRange } from "../../types";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface Props {
    showYearSelector: boolean;
    setShowYearSelector: React.Dispatch<React.SetStateAction<boolean>>;
    yearRange: YearRange;
    onConfirm: (yearRange: YearRange) => void;
    onCancel: () => void;
}

const YearModal = ({
    showYearSelector,
    setShowYearSelector,
    yearRange,
    onConfirm,
    onCancel,
}: Props) => {
    const [sliderValue, setSliderValue] = useState([
        yearRange.from,
        yearRange.to,
    ]);

    const sliderMarks = [
        {
            value: 0,
            label: "1960",
        },
        {
            value: 25,
            label: "1975",
        },
        {
            value: 50,
            label: "1990",
        },
        {
            value: 75,
            label: "2005",
        },
        {
            value: 100,
            label: "2023",
        },
    ];

    const calculateYear = (value: number) => {
        const yearDifference = new Date().getFullYear() - 1960;
        const num = Math.round((value / 100) * yearDifference) + 1960;
        return num;
    };

    return (
        <Modal
            isCentered={true}
            isOpen={showYearSelector}
            onClose={() => setShowYearSelector(false)}
        >
            <ModalOverlay />
            <ModalContent rounded="3xl" mx={4}>
                <Flex
                    h="full"
                    w="full"
                    bg="brand.backgroundSecondary"
                    rounded="3xl"
                    p={showYearSelector ? 4 : 0}
                >
                    <Flex w="full" direction="column" gap={4}>
                        <Text fontSize="xl" textAlign="center">
                            Select Year Range
                        </Text>
                        <Box w="full" mt={10} px={8}>
                            <RangeSlider
                                w="full"
                                aria-label={["min", "max"]}
                                defaultValue={[30, 80]}
                                onChange={(val) => setSliderValue(val)}
                            >
                                {sliderMarks.map((mark) => (
                                    <RangeSliderMark
                                        key={mark.value}
                                        value={mark.value}
                                        fontSize="sm"
                                        mt={6}
                                        ml={-4}
                                    >
                                        {mark.label}
                                    </RangeSliderMark>
                                ))}
                                <RangeSliderMark
                                    value={sliderValue[0]}
                                    textAlign="center"
                                    color="white"
                                    w={10}
                                    m={-10}
                                    ml={-5}
                                >
                                    {calculateYear(sliderValue[0])}
                                </RangeSliderMark>
                                <RangeSliderMark
                                    value={sliderValue[1]}
                                    textAlign="center"
                                    color="white"
                                    w={10}
                                    m={-10}
                                    ml={-5}
                                >
                                    {calculateYear(sliderValue[1])}
                                </RangeSliderMark>

                                <RangeSliderTrack bg="brand.primaryOpaque">
                                    <RangeSliderFilledTrack bg="brand.primary" />
                                </RangeSliderTrack>
                                <RangeSliderThumb boxSize={6} index={0}>
                                    <FiberManualRecordIcon
                                        sx={{
                                            color: "#293533",
                                        }}
                                    />
                                </RangeSliderThumb>
                                <RangeSliderThumb boxSize={6} index={1}>
                                    <FiberManualRecordIcon
                                        sx={{
                                            color: "#293533",
                                        }}
                                    />
                                </RangeSliderThumb>
                            </RangeSlider>
                        </Box>
                        <Flex gap={4}>
                            <Button
                                onClick={() =>
                                    onConfirm({
                                        from: calculateYear(sliderValue[0]),
                                        to: calculateYear(sliderValue[1]),
                                    })
                                }
                                mt={10}
                                variant="primary"
                            >
                                Confirm
                            </Button>
                            <Button onClick={onCancel} mt={10} variant="cancel">
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            </ModalContent>
        </Modal>
    );
};

export default YearModal;
