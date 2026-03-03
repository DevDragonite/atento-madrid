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
            className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center"
        >
            {/* Background image with parallax */}
            <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
                <Image
                    src="/images/hero.png"
                    alt="Mesa íntima de atento."
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* Warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/30 to-charcoal/70" />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 text-center px-6 flex flex-col items-center"
                style={{ y: textY, opacity }}
            >
                {/* Eyebrow */}
                <motion.p
                    className="font-sans text-xs tracking-[0.22em] uppercase text-cream/60 mb-8"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    Madrid — Cena privada · Solo 5 invitados
                </motion.p>

                {/* Main title */}
                <motion.h1
                    className="font-serif font-light text-cream mb-2"
                    style={{ fontSize: "clamp(5rem, 18vw, 14rem)", lineHeight: 0.85, letterSpacing: "-0.04em" }}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    atento.
                </motion.h1>

                {/* Divider line */}
                <motion.div
                    className="w-px bg-cream/40 my-8"
                    initial={{ height: 0 }}
                    animate={{ height: 48 }}
                    transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Subtitle */}
                <motion.p
                    className="font-serif italic font-light text-cream/80 max-w-md text-balance text-center"
                    style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)", lineHeight: 1.5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                    Aquí no solo vienes a cenar.<br />
                    Aquí eres atendido.
                </motion.p>

                {/* CTA */}
                <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <MagneticButton href="#reservas" className="bg-cream/10 text-cream border border-cream/40 hover:bg-cream hover:text-charcoal transition-colors duration-500">
                        Solicitar Reserva
                    </MagneticButton>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-cream/40">Descubrir</p>
                <motion.div
                    className="w-px h-10 bg-cream/30"
                    animate={{ scaleY: [1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeIn" }}
                    style={{ transformOrigin: "top" }}
                />
            </motion.div>
        </section>
    );
}
