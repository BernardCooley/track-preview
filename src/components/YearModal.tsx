"use client";

import {
    Button,
    Divider,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { YearRange } from "../../types";
import RangeSlider from "react-range-slider-input";
import "../app/styles/range-slider.css";

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

    const sliderMarks = ["1960", "1980", "2000", new Date().getFullYear()];

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
                        <Flex w="full" mt={6} px={8} direction="column" gap={6}>
                            <Text
                                fontSize="xl"
                                textAlign="center"
                            >{`${sliderValue[0]} - ${sliderValue[1]}`}</Text>
                            <RangeSlider
                                min={1960}
                                max={2023}
                                defaultValue={[yearRange.from, yearRange.to]}
                                value={sliderValue}
                                onInput={(val: any) => {
                                    setSliderValue(val as number[]);
                                }}
                            />
                            <Flex justifyContent="space-between" h={8}>
                                {sliderMarks.map((year) => (
                                    <Flex
                                        key={year}
                                        direction="column"
                                        alignItems="center"
                                    >
                                        <Divider orientation="vertical" />
                                        <Text>{year}</Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Flex>
                        <Flex gap={4} mt={6} justifyContent="flex-end">
                            <Button
                                onClick={() =>
                                    onConfirm({
                                        from: sliderValue[0],
                                        to: sliderValue[1],
                                    })
                                }
                                variant="primary"
                            >
                                Confirm
                            </Button>
                            <Button onClick={onCancel} variant="cancel">
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
