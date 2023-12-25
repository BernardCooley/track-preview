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
import React, { useEffect, useState } from "react";
import { YearRange } from "../../types";
import RangeSlider from "react-range-slider-input";
import "../app/styles/range-slider.css";
import { getCurrentYear } from "../../utils";
import { decades } from "../../consts";

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
    const [decadeIndex, setDecadeIndex] = useState<number | null>(null);
    const [sliderValue, setSliderValue] = useState<number[]>([
        yearRange.from,
        yearRange.to,
    ]);
    const [setButtonLoading, setSetButtonLoading] = useState<boolean>(false);

    useEffect(() => {
        if (decadeIndex !== null) {
            setSliderValue([
                decades[decadeIndex].from,
                decades[decadeIndex].to,
            ]);
        }
    }, [decadeIndex]);

    useEffect(() => {
        setSliderValue([yearRange?.from, yearRange?.to]);
    }, [yearRange]);

    const sliderMarks = ["1960", "1980", "2000", getCurrentYear()];

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
                        <Flex
                            justifyContent="space-between"
                            gap={1}
                            flexWrap="wrap"
                        >
                            {decades.map((decade, index) => (
                                <Button
                                    _focusVisible={{
                                        boxShadow: "none",
                                    }}
                                    fontSize={
                                        decadeIndex === index ? "lg" : "md"
                                    }
                                    color={
                                        decadeIndex === index
                                            ? "brand.textPrimary"
                                            : "brand.textPrimaryLight"
                                    }
                                    outline="1px solid"
                                    outlineColor={
                                        decadeIndex === index
                                            ? "brand.primary"
                                            : decadeIndex === null
                                            ? "transparent"
                                            : "brand.backgroundSecondary"
                                    }
                                    key={decade.title}
                                    onClick={() => {
                                        setDecadeIndex(index);
                                    }}
                                    variant="tertiary"
                                >
                                    {decade.title}
                                </Button>
                            ))}
                        </Flex>
                        <Flex w="full" mt={6} px={8} direction="column" gap={6}>
                            <Text
                                fontSize="xl"
                                textAlign="center"
                            >{`${sliderValue[0]} - ${sliderValue[1]}`}</Text>
                            <RangeSlider
                                min={1960}
                                max={2023}
                                defaultValue={[yearRange?.from, yearRange?.to]}
                                value={sliderValue}
                                onInput={(val: any) => {
                                    setSliderValue(val as number[]);
                                    setDecadeIndex(null);
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
                                        <Text userSelect="none">{year}</Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Flex>
                        <Flex gap={4} mt={6} justifyContent="flex-end">
                            <Button
                                isDisabled={
                                    sliderValue[0] === 1960 &&
                                    sliderValue[1] === getCurrentYear()
                                }
                                onClick={() => {
                                    setSliderValue([1960, getCurrentYear()]);
                                }}
                                variant="primary"
                            >
                                All years
                            </Button>
                            <Button
                                isDisabled={
                                    sliderValue[0] === yearRange.from &&
                                    sliderValue[1] === yearRange.to
                                }
                                isLoading={setButtonLoading}
                                onClick={() => {
                                    setSetButtonLoading(true);
                                    onConfirm({
                                        from: sliderValue[0] as number,
                                        to: sliderValue[1] as number,
                                    });
                                    setTimeout(() => {
                                        setSetButtonLoading(false);
                                    }, 1000);
                                }}
                                variant="primary"
                            >
                                Confirm
                            </Button>
                            <Button onClick={() => onCancel()} variant="cancel">
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
