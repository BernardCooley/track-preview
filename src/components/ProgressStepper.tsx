import {
    Box,
    Button,
    Flex,
    Steps,
} from "@chakra-ui/react";
import React from "react";

const steps = [
    { title: "First", description: "Review" },
    { title: "Second", description: "Review" },
    { title: "Final", description: "Review" },
    { title: "Library", description: "" },
];

interface Props {
    onStepChange: (step: number) => void;
    currentStep: number;
}

const ProgressStepper = ({ onStepChange, currentStep }: Props) => {
    return (
        <Steps.Root
            colorPalette="teal"
            step={currentStep - 1}
            size={["sm", "md", "lg"]}
            count={steps.length}
            px={[4, 0, 0]}
            pt={4}
        >
            <Steps.List>
                {steps.map((step, index) => (
                    <Steps.Item key={index} index={index}>
                        <Button
                            py={3}
                            h="auto"
                            variant="ghost"
                            onClick={() => {
                                onStepChange(index + 1);
                            }}
                        >
                            <Steps.Indicator fontSize="sm" />
                        </Button>
                        <Box flexShrink="0" display={["none", "none", "block"]}>
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Description>{step.description}</Steps.Description>
                        </Box>
                        <Steps.Separator />
                    </Steps.Item>
                ))}
            </Steps.List>
        </Steps.Root>
    );
};

export default ProgressStepper;
