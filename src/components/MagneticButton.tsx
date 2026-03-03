"use client";

import { useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "outline";
}

export default function MagneticButton({
    children,
    className = "",
    href,
    onClick,
    variant = "primary",
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);
    const scale = useSpring(1, { stiffness: 200, damping: 20 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distX = e.clientX - centerX;
            const distY = e.clientY - centerY;
            const distance = Math.sqrt(distX ** 2 + distY ** 2);
            const maxDistance = 80;
            const force = Math.max(0, 1 - distance / maxDistance);
            x.set(distX * force * 0.5);
            y.set(distY * force * 0.5);
            scale.set(1.04);
        },
        [x, y, scale]
    );

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        scale.set(1);
    }, [x, y, scale]);

    const baseClass =
        variant === "primary"
            ? "inline-flex items-center justify-center px-10 py-4 bg-charcoal text-cream font-sans text-sm tracking-[0.14em] uppercase cursor-pointer select-none"
            : "inline-flex items-center justify-center px-10 py-4 border border-charcoal text-charcoal font-sans text-sm tracking-[0.14em] uppercase cursor-pointer select-none";

    const buttonContent = (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y, scale }}
            className={`${baseClass} ${className}`}
            onClick={onClick}
        >
            {children}
            <motion.span
                className="ml-3 inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                →
            </motion.span>
        </motion.div>
    );

    if (href) {
        return (
            <a href={href} className="block w-fit">
                {buttonContent}
            </a>
        );
    }

    return buttonContent;
}
