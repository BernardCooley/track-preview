"use client";

import {
    Box,
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

    const DecadeTag = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void }) => (
        <Box
            as="button"
            onClick={onClick}
            px={3}
            py={1.5}
            fontSize="sm"
            fontWeight={isActive ? "medium" : "normal"}
            rounded="md"
            cursor="pointer"
            position="relative"
            transition="all 0.15s ease"
            color={isActive ? "brand.primary" : "brand.textPrimary"}
            borderLeft={isActive ? "2px solid" : "2px solid transparent"}
            borderLeftColor={isActive ? "brand.primary" : "transparent"}
            css={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: isActive
                    ? "color-mix(in srgb, var(--chakra-colors-brand-primary) 10%, transparent)"
                    : "var(--chakra-colors-brand-surface)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                    background: isActive
                        ? "color-mix(in srgb, var(--chakra-colors-brand-primary) 15%, transparent)"
                        : "var(--chakra-colors-brand-surface-hover)",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                },
            }}
        >
            {title}
        </Box>
    );

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
                    overflow="hidden"
                >
                    <Flex
                        w="full"
                        direction="column"
                    >
                        <Flex
                            px={[4, 5]}
                            pt={[4, 5]}
                            pb={3}
                            direction="column"
                            gap={4}
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                letterSpacing="-0.01em"
                            >
                                Year Range
                            </Text>

                            <Flex
                                justifyContent="center"
                                gap={1.5}
                                flexWrap="wrap"
                            >
                                {decades.map((decade, index) => (
                                    <DecadeTag
                                        key={decade.title}
                                        title={decade.title}
                                        isActive={decadeIndex === index}
                                        onClick={() => setDecadeIndex(index)}
                                    />
                                ))}
                            </Flex>
                        </Flex>

                        <Box
                            h="1px"
                            bg="brand.divider"
                            mx={[4, 5]}
                        />

                        <Flex w="full" px={[4, 5]} py={5} direction="column" gap={5}>
                            <Text
                                fontSize="xl"
                                fontWeight="semibold"
                                textAlign="center"
                                color="brand.primary"
                            >
                                {sliderValue[0]} - {sliderValue[1]}
                            </Text>
                            <Box px={[0, 2]}>
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
                                <Flex justifyContent="space-between" h={6} mt={2}>
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
                            </Box>
                        </Flex>

                        <Flex
                            gap={3}
                            px={[4, 5]}
                            py={4}
                            justifyContent="flex-end"
                            css={{
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                borderTop: "1px solid var(--chakra-colors-brand-divider)",
                            }}
                        >
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
