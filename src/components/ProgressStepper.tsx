import {
    Box,
    Button,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
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
        <Stepper
            variant="primary"
            colorScheme="teal"
            index={currentStep}
            size={["sm", "md", "lg"]}
            px={[4, 0, 0]}
            pt={4}
        >
            {steps.map((step, index) => (
                <Step key={index}>
                    <Button
                        py={4}
                        h="auto"
                        variant="ghost"
                        onClick={() => {
                            onStepChange(index + 1);
                        }}
                        isActive={currentStep === index + 1}
                    >
                        <StepIndicator fontSize="sm">
                            <StepStatus
                                complete={<StepIcon />}
                                incomplete={<StepNumber />}
                                active={<StepNumber />}
                            />
                        </StepIndicator>
                    </Button>
                    <Box flexShrink="0" display={["none", "none", "block"]}>
                        <StepTitle>{step.title}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                    </Box>

                    <StepSeparator />
                </Step>
            ))}
        </Stepper>
    );
};

export default ProgressStepper;
