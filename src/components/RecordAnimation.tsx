import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Track } from "../../types";

interface Props {
    animate: "like" | "dislike" | null;
    reviewStep: number;
    animationDuration: number;
    image: Track["thumbnail"];
}

const RecordAnimation = ({
    animate,
    reviewStep,
    animationDuration,
    image,
}: Props) => {
    const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
    const [start, setStart] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const trackInfo = document.querySelector("[data-track-info]");
        if (trackInfo) {
            const rect = trackInfo.getBoundingClientRect();
            setStart({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }

        if (animate === "like") {
            const nextTab = document.querySelector(
                `[data-tab-step="${reviewStep + 1}"]`
            ) as HTMLElement | null;
            if (nextTab) {
                const rect = nextTab.getBoundingClientRect();
                setTarget({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                });

                const arriveTime = animationDuration * 0.75;
                const openBefore = 0.15;
                const closeAfter = 0.25;

                const saved = nextTab.style.transition;
                const savedTransform = nextTab.style.transform;

                const openTimer = setTimeout(() => {
                    nextTab.style.transition = `transform ${openBefore}s ease-out`;
                    nextTab.style.transform = "scaleY(1.35) scaleX(1.12)";
                }, (arriveTime - openBefore) * 1000);

                const closeTimer = setTimeout(() => {
                    nextTab.style.transition = `transform ${closeAfter}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                    nextTab.style.transform = savedTransform || "scaleY(1) scaleX(1)";
                }, arriveTime * 1000);

                const cleanupTimer = setTimeout(() => {
                    nextTab.style.transition = saved;
                    nextTab.style.transform = savedTransform || "";
                }, (arriveTime + closeAfter + 0.1) * 1000);

                return () => {
                    clearTimeout(openTimer);
                    clearTimeout(closeTimer);
                    clearTimeout(cleanupTimer);
                    nextTab.style.transition = saved;
                    nextTab.style.transform = savedTransform || "";
                };
            }
        }
    }, [animate, reviewStep, animationDuration]);

    const fallbackX =
        typeof window !== "undefined" ? window.innerWidth / 2 : 200;
    const fallbackY =
        typeof window !== "undefined" ? window.innerHeight * 0.75 : 500;

    const startX = start?.x ?? fallbackX;
    const startY = start?.y ?? fallbackY;

    const size =
        typeof window !== "undefined" && window.innerWidth < 640 ? 80 : 110;
    const endSize = 20;

    const vinylStyle: React.CSSProperties = {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        backgroundImage: "url(./vinyl.png)",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const labelStyle: React.CSSProperties = {
        width: "50%",
        height: "50%",
        borderRadius: "50%",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
    };

    if (animate === "dislike") {
        return (
            <AnimatePresence>
                <motion.div
                    style={{
                        position: "fixed",
                        width: size,
                        height: size,
                        zIndex: 200,
                        filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))",
                    }}
                    initial={{
                        left: startX - size / 2,
                        top: startY - size / 2,
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                    }}
                    animate={{
                        top: startY + 200,
                        opacity: 0,
                        scale: 0.3,
                        rotate: -180,
                    }}
                    transition={{
                        duration: animationDuration * 0.8,
                        ease: "easeIn",
                    }}
                >
                    <div style={vinylStyle}>
                        <div style={labelStyle} />
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (animate === "like" && target) {
        const midX = startX + (target.x - startX) * 0.5;
        const midY = target.y + (startY - target.y) * 0.4;
        const scaleEnd = endSize / size;

        return (
            <AnimatePresence>
                <motion.div
                    style={{
                        position: "fixed",
                        width: size,
                        height: size,
                        zIndex: 200,
                        filter: "drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))",
                    }}
                    initial={{
                        left: startX - size / 2,
                        top: startY - size / 2,
                        scale: 1,
                        opacity: 1,
                    }}
                    animate={{
                        left: [
                            startX - size / 2,
                            midX - size / 2,
                            target.x - size / 2,
                        ],
                        top: [
                            startY - size / 2,
                            midY - size / 2,
                            target.y - size / 2,
                        ],
                        scale: [1, 0.8, scaleEnd],
                        opacity: [1, 1, 1],
                    }}
                    transition={{
                        duration: animationDuration,
                        ease: [0.32, 0, 0.24, 1],
                        times: [0, 0.55, 1],
                    }}
                >
                    <motion.div
                        style={vinylStyle as any}
                        animate={{ rotate: 720 }}
                        transition={{
                            duration: animationDuration,
                            ease: "linear",
                        }}
                    >
                        <div style={labelStyle} />
                    </motion.div>
                </motion.div>

                {[...Array(6)].map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    const spread = 40 + i * 8;
                    return (
                        <motion.div
                            key={i}
                            style={{
                                position: "fixed",
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: "#10b981",
                                zIndex: 199,
                            } as any}
                            initial={{
                                left: startX,
                                top: startY,
                                scale: 1,
                                opacity: 0.8,
                            }}
                            animate={{
                                left: startX + Math.cos(angle) * spread,
                                top: startY + Math.sin(angle) * spread,
                                scale: 0,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: 0.05,
                            }}
                        />
                    );
                })}
            </AnimatePresence>
        );
    }

    return null;
};

export default RecordAnimation;
