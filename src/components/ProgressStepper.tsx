import { Box, Button, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import React from "react";
import { useTrackContext } from "../../context/TrackContext";

const steps = [
    { title: "First", description: "Review" },
    { title: "Second", description: "Review" },
    { title: "Final", description: "Review" },
    { title: "Buy", description: "" },
];

const ProgressStepper = () => {
    const { currentStep, updateCurrentStep } = useTrackContext();

    return (
        <Stepper
            index={currentStep}
            size={["sm", "md", "lg"]}
            px={[4, 0, 0]}
            pt={[4, 0, 0]}
        >
            {steps.map((step, index) => (
                <Step key={index}>
                    <Button
                        variant="ghost"
                        onClick={() => updateCurrentStep(index + 1)}
                        isActive={currentStep === index + 1}
                    >
                        <StepIndicator>
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
