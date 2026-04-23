"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Ocultar el cursor default
        document.body.style.cursor = 'none';

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements or specific 'magnetic' classes
            if (
                window.getComputedStyle(target).cursor === "pointer" ||
                target.closest("button") ||
                target.closest("a") ||
                target.closest(".hover-trigger")
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    // Desactivar cursor custom en touch devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
        return null;
    }

    return (
        <motion.div
            className="fixed top-0 left-0 w-4 h-4 bg-neutral-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
            animate={{
                x: mousePosition.x - (isHovered ? 24 : 8),
                y: mousePosition.y - (isHovered ? 24 : 8),
                width: isHovered ? 48 : 16,
                height: isHovered ? 48 : 16,
                backgroundColor: isHovered ? "var(--color-primary)" : "var(--color-neutral-gold)",
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 0.5,
            }}
        />
    );
}
