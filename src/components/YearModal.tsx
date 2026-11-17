"use client";

import {
    Button,
    Dialog,
    Flex,
    Separator,
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
        <Dialog.Root
            placement="center"
            open={showYearSelector}
            onOpenChange={(details) => { if (!details.open) setShowYearSelector(false); }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    rounded="modal"
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                >
                    <Flex
                        w="full"
                        rounded="modal"
                        p={showYearSelector ? [4, 5] : 0}
                        direction="column"
                        gap={5}
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            textAlign="center"
                            color="brand.textPrimary"
                        >
                            Select Year Range
                        </Text>

                        <Flex
                            justifyContent="center"
                            gap={1.5}
                            flexWrap="wrap"
                        >
                            {decades.map((decade, index) => (
                                <Button
                                    key={decade.title}
                                    variant={
                                        decadeIndex === index
                                            ? "subtle"
                                            : "surface"
                                    }
                                    onClick={() => setDecadeIndex(index)}
                                    height="34px"
                                    fontSize="sm"
                                    px={3}
                                >
                                    {decade.title}
                                </Button>
                            ))}
                        </Flex>

                        <Flex w="full" mt={2} px={[4, 6]} direction="column" gap={5}>
                            <Text
                                fontSize="xl"
                                fontWeight="semibold"
                                textAlign="center"
                                color="brand.primary"
                            >
                                {sliderValue[0]} - {sliderValue[1]}
                            </Text>
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
                            <Flex justifyContent="space-between" h={6}>
                                {sliderMarks.map((year) => (
                                    <Flex
                                        key={year}
                                        direction="column"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <Separator
                                            orientation="vertical"
                                            borderColor="brand.border"
                                        />
                                        <Text
                                            fontSize="xs"
                                            color="brand.textMuted"
                                            userSelect="none"
                                        >
                                            {year}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Flex>

                        <Flex gap={3} mt={2} justifyContent="flex-end">
                            <Button
                                disabled={
                                    sliderValue[0] === 1960 &&
                                    sliderValue[1] === getCurrentYear()
                                }
                                onClick={() => {
                                    setSliderValue([1960, getCurrentYear()]);
                                }}
                                variant="outline"
                                height="42px"
                            >
                                All years
                            </Button>
                            <Button
                                disabled={
                                    sliderValue[0] === yearRange.from &&
                                    sliderValue[1] === yearRange.to
                                }
                                loading={setButtonLoading}
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
                                height="42px"
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={() => onCancel()}
                                variant="cancel"
                                height="42px"
                            >
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default YearModal;
