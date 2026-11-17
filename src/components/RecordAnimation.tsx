import React from "react";
import { Box, Center } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Track } from "../../types";

interface Props {
    animate: "like" | "dislike" | null;
    leftPosition: number;
    animationDuration: number;
    image: Track["thumbnail"];
}

const RecordAnimation = ({
    animate,
    leftPosition,
    animationDuration,
    image,
}: Props) => {
    const isMobile = window.innerWidth < 600;
    const MotionCenter = motion(Center);
    const initial = { top: 200, left: "40%", opacity: 0 };

    const getAnimation = () => {
        if (animate) {
            return animate === "like"
                ? { top: isMobile ? -65 : -100, left: leftPosition, opacity: 1 }
                : { top: 300, opacity: 1 };
        }
        return initial;
    };

    return (
        <MotionCenter
            initial={initial}
            animate={getAnimation()}
            transition={{ duration: animationDuration }}
            zIndex={animate ? 150 : 0}
            transform="translate(50%, 0)"
            position="absolute"
            px={4}
            justifyContent="center"
            alignItems="center"
            w={animate ? ["60px", "90px"] : "300px"}
            h={animate ? ["60px", "90px"] : "300px"}
            rounded="full"
            bgImage="./vinyl.png"
            bgSize="cover"
        >
            <Box
                bgImage={image}
                bgSize="cover"
                w="100%"
                h="50%"
                rounded="full"
                backgroundPosition="center"
            />
        </MotionCenter>
    );
};

export default RecordAnimation;
