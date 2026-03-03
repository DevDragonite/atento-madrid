"use client";

import { motion, MotionProps, Variants } from "framer-motion";

interface ScrollRevealProps extends MotionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "left" | "right" | "none";
}

const variants: Record<string, Variants> = {
    up: {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0 },
    },
    left: {
        hidden: { opacity: 0, x: -32 },
        visible: { opacity: 1, x: 0 },
    },
    right: {
        hidden: { opacity: 0, x: 32 },
        visible: { opacity: 1, x: 0 },
    },
    none: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
};

export default function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
    ...rest
}: ScrollRevealProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            variants={variants[direction]}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
