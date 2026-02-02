"use client";

import React from "react";
import { motion, useInView, type Variants } from "motion/react";

interface TimelineContentProps {
    children: React.ReactNode;
    animationNum?: number;
    timelineRef?: React.RefObject<HTMLElement | null>;
    customVariants?: Variants;
    className?: string;
    as?: string | React.ElementType;
}

export const TimelineContent = ({
    children,
    animationNum = 0,
    timelineRef,
    customVariants,
    className,
    as = "div",
}: TimelineContentProps) => {
    const localRef = React.useRef(null);
    const isInView = useInView(timelineRef || localRef, { once: true, margin: "-100px" });

    const defaultVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: animationNum * 0.1,
            },
        },
    };

    // Map string tags to motion components
    const MotionComponent = typeof as === 'string' && (motion as any)[as]
        ? (motion as any)[as]
        : motion.div;

    return (
        <MotionComponent
            ref={localRef}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={customVariants || defaultVariants}
            className={className}
            custom={animationNum}
        >
            {children}
        </MotionComponent>
    );
};
