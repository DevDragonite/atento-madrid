"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

export default function HeroSection() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section
            ref={ref}
            id="hero"
            className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center justify-center @container"
        >
            {/* Background image with parallax */}
            <motion.div className="absolute inset-0 z-0 bg-background-dark" style={{ y: imageY }}>
                <Image
                    src="/images/hero.png"
                    alt="Mesa íntima de atento."
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* Stitch style dark overlay */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundImage: "linear-gradient(to bottom, rgba(34, 30, 16, 0.4), rgba(34, 30, 16, 0.9))" }}
                />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4"
                style={{ y: textY, opacity }}
            >
                <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
                    {/* Eyebrow */}
                    <motion.h4
                        className="text-primary text-xs font-bold tracking-[0.4em] uppercase mb-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        El Ritual del Silencio
                    </motion.h4>

                    {/* Main title */}
                    <motion.h1
                        className="text-primary font-serif-title text-7xl md:text-9xl font-normal leading-none tracking-tight"
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        ATENTO
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto italic"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Aquí no solo vienes a cenar.<br />
                        Aquí eres atendido.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        className="pt-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* We use MagneticButton as a wrapper to keep the animation, but style the inner button as Stitch */}
                        <MagneticButton href="#reservas" className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-white/5 backdrop-blur-md border border-primary/30 rounded-full hover:border-primary hover:bg-white/10 active:scale-95 overflow-hidden">
                            <span className="relative z-10 text-sm tracking-[0.2em] uppercase">Solicitar Reserva</span>
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </MagneticButton>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll indicator - Updated to Stitch style */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--color-primary)" className="text-3xl">
                        <path d="M480-226.67 240-466.67l47.33-47.33L480-321.33l192.67-192.67 47.33 47.33L480-226.67ZM480-496 240-736l47.33-47.33L480-590.67l192.67-192.67 47.33 47.33L480-496Z" />
                    </svg>
                </motion.div>
            </motion.div>
        </section>
    );
}
