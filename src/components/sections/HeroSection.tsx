"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Parallax logic for background image
    const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    const yTextFast = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yTextSlow = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

    return (
        <section
            ref={containerRef}
            className="relative h-screen w-full bg-background-dark pt-32 pb-16 flex items-center overflow-hidden"
        >
            <div className="absolute inset-0 px-6 md:px-12 w-full h-full flex flex-col justify-center">
                
                {/* Asymmetric Image Container */}
                <motion.div 
                    initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)" }}
                    animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)" }}
                    transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                    className="absolute top-1/2 -translate-y-1/2 right-[5%] md:right-[15%] w-[85vw] md:w-[45vw] h-[65vh] md:h-[80vh] overflow-hidden rounded-bl-[10vw] rounded-tr-3xl"
                >
                    <motion.div style={{ y: yImage }} className="absolute inset-x-0 -top-[20%] h-[140%] w-full">
                        <img
                            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop"
                            alt="Mesa exclusiva lista para la cena"
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-background-dark/20 mix-blend-multiply" />
                    </motion.div>
                </motion.div>

                {/* Staggered Text overlapping image */}
                <div className="relative z-10 w-full md:w-3/4 flex flex-col pointer-events-none mt-32 md:mt-0">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                        className="mb-8 pl-2 md:pl-0"
                    >
                        <span className="font-sans text-[9px] md:text-xs tracking-[0.4em] uppercase text-primary/80 block">
                            Tu Supper Club — Privado
                        </span>
                    </motion.div>

                    <div className="flex flex-col gap-0 md:-gap-4 mix-blend-difference overflow-visible">
                        <div className="overflow-visible">
                            <motion.h1 style={{ y: yTextSlow }}
                                initial={{ y: "120%", rotate: 2 }}
                                animate={{ y: "0%", rotate: 0 }}
                                transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
                                className="font-serif-title text-7xl md:text-[8rem] lg:text-[11rem] leading-[0.8] text-white tracking-tighter"
                            >
                                <span className="italic text-primary/90 pr-4">Un Secreto</span>
                            </motion.h1>
                        </div>
                        <div className="overflow-visible ml-[10vw] md:ml-[15vw]">
                            <motion.h1 style={{ y: yTextFast }}
                                initial={{ y: "120%", rotate: -2 }}
                                animate={{ y: "0%", rotate: 0 }}
                                transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
                                className="font-serif-title text-7xl md:text-[8rem] lg:text-[11rem] leading-[0.85] text-cream tracking-tighter"
                            >
                                Compartido.
                            </motion.h1>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1.2 }}
                        className="mt-16 md:mt-24 max-w-sm ml-6 md:ml-[10vw] pl-6 border-l border-primary/20 bg-background-dark/30 backdrop-blur-sm p-4 rounded-r-lg"
                    >
                        <p className="font-sans text-neutral-gold text-sm md:text-sm leading-relaxed tracking-wide mix-blend-normal">
                            Una sola mesa. Tu propio círculo. Una experiencia gastronómica donde el tiempo se detiene y la confianza dicta la noche.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
