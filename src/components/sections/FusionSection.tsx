"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const menuItems = [
    {
        src: "/images/dish1.png",
        alt: "Buñuelo de maíz thai",
        course: "Aperitivo",
        title: "Buñuelo de maíz thai",
        desc: "Maíz dulce asiático crocante con sweet chili de jengibre y cream fraiche de yuzu y cebollino.",
    },
    {
        src: "/images/dish2.png",
        alt: "Ensaladilla de gamba y cacahuete",
        course: "Entrante",
        title: "Ensaladilla de gamba",
        desc: "Ensaladilla rusa asiática con mahonesa de aceite de langostinos, galleta de gamba y crema de cacahuete.",
    },
    {
        src: "/images/dish3.png",
        alt: "Lubina al curry con coco y mejillones",
        course: "Principal",
        title: "Lubina al curry",
        desc: "Crema de curry con fideos de arroz, maíz baby rostizado, mahonesa de chiles, langostino, polvo de avellanas y cítricos.",
    },
];

const extras = [
    {
        course: "Sorbete",
        title: "Sorbete thai",
        desc: "Lima, leche de coco, citronela y coco tostado.",
    },
    {
        course: "Postre",
        title: "Arroz con leche frito",
        desc: "Arroz con leche frito, té matcha y quenelle de helado de pistacho salado.",
    },
];

/* ── Carousel images ──────────────────────────────────────────────── */
const carouselImages = [
    { src: "/comida.png", alt: "Plato de temporada 1" },
    { src: "/comida2.png", alt: "Plato de temporada 2" },
    { src: "/comida.png", alt: "Plato de temporada 3" },
    { src: "/comida2.png", alt: "Plato de temporada 4" },
    { src: "/comida.png", alt: "Plato de temporada 5" },
    { src: "/comida2.png", alt: "Plato de temporada 6" },
];

function TiltCard({
    src,
    alt,
    course,
    title,
    desc,
    delay,
}: {
    src: string;
    alt: string;
    course: string;
    title: string;
    desc: string;
    delay: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const rawRotateX = useMotionValue(0);
    const rawRotateY = useMotionValue(0);
    const rotateX = useSpring(rawRotateX, { stiffness: 120, damping: 20 });
    const rotateY = useSpring(rawRotateY, { stiffness: 120, damping: 20 });
    const scale = useSpring(1, { stiffness: 200, damping: 25 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            rawRotateY.set(x * 8);
            rawRotateX.set(-y * 8);
            scale.set(1.02);
        },
        [rawRotateX, rawRotateY, scale]
    );

    const handleMouseLeave = useCallback(() => {
        rawRotateX.set(0);
        rawRotateY.set(0);
        scale.set(1);
    }, [rawRotateX, rawRotateY, scale]);

    return (
        <ScrollReveal delay={delay} className="h-full">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
                className="group relative overflow-hidden bg-cream h-full flex flex-col cursor-crosshair"
            >
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-charcoal/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="pt-8 pb-10 flex flex-col gap-3 flex-1">
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-terracotta">{course}</span>
                    <h3 className="font-serif text-2xl md:text-3xl font-light text-charcoal">{title}</h3>
                    <p className="font-sans text-sm leading-relaxed text-warm-gray">{desc}</p>
                </div>
            </motion.div>
        </ScrollReveal>
    );
}

/* ── Infinite carousel ────────────────────────────────────────────── */
function InfiniteCarousel() {
    // Duplicate array for seamless looping
    const items = [...carouselImages, ...carouselImages];

    return (
        <div className="relative overflow-hidden mt-24 mb-4">
            {/* Fading edges */}
            <div className="absolute left-0 top-0 h-full w-20 md:w-32 z-10 bg-gradient-to-r from-linen to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 md:w-32 z-10 bg-gradient-to-l from-linen to-transparent pointer-events-none" />

            <motion.div
                className="flex gap-6"
                animate={{ x: [0, "-50%"] }}
                transition={{
                    x: {
                        duration: 28,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                    },
                }}
            >
                {items.map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.7, delay: (i % carouselImages.length) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex-shrink-0 overflow-hidden"
                        style={{ width: "clamp(220px, 28vw, 380px)", aspectRatio: "4/3" }}
                    >
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="380px"
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default function FusionSection() {
    return (
        <section id="fusion" className="bg-background-dark overflow-hidden flex flex-col pt-20 lg:pt-0">
            {/* Split-Screen Hero Section */}
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Left Side: Visual */}
                <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-screen lg:sticky lg:top-0 order-2 lg:order-1">
                    <div className="absolute inset-0">
                        <Image
                            src="/comida.png"
                            alt="Fusión española tailandesa"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute bottom-12 left-12 hidden lg:block">
                        <div className="flex items-center gap-4 text-primary bg-background-dark/80 backdrop-blur-md px-6 py-3 rounded-full border border-primary/20">
                            <span className="w-8 h-px bg-primary"></span>
                            <span className="text-xs uppercase tracking-widest font-bold">El Arte de Emplatar</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Editorial Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center bg-background-dark px-8 py-20 lg:p-24 xl:p-32 order-1 lg:order-2">
                    <div className="max-w-xl mx-auto lg:mx-0 space-y-12">
                        {/* Header Details */}
                        <ScrollReveal>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-primary">
                                    <svg className="size-5" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd"></path>
                                    </svg>
                                    <span className="text-xs font-bold tracking-[0.3em] uppercase">El Secreto Mejor Guardado</span>
                                </div>

                                <h2 className="font-serif-title text-5xl md:text-6xl text-slate-100 leading-[1.1] tracking-tight">
                                    Una sola propuesta.<br />
                                    <span className="italic text-neutral-gold">Cinco momentos.</span>
                                </h2>
                                <div className="w-20 h-[2px] bg-primary/40"></div>
                            </div>
                        </ScrollReveal>

                        {/* Description */}
                        <ScrollReveal delay={0.1}>
                            <p className="text-lg lg:text-xl text-neutral-gold/90 font-light leading-relaxed">
                                Sin carta. Sin elección. Solo la mejor versión de lo que cada temporada
                                te puede dar — interpretada con técnica española y alma asiática.
                            </p>
                        </ScrollReveal>

                        {/* Menu Items (Replacing TiltCard) */}
                        <div className="space-y-12 md:space-y-10 pt-8 lg:pt-12">
                            {menuItems.map((dish, i) => (
                                <ScrollReveal key={dish.title} delay={0.1 + (i * 0.1)}>
                                    <div className="group border-l-2 border-primary/30 pl-5 md:pl-6 hover:border-primary transition-colors duration-300">
                                        <span className="font-sans text-[10px] md:text-xs tracking-[0.25em] uppercase text-primary/80 mb-2 block">{dish.course}</span>
                                        <h3 className="font-serif-title text-2xl md:text-3xl text-slate-100 mb-3 group-hover:text-white transition-colors leading-tight">{dish.title}</h3>
                                        <p className="font-sans text-[15px] md:text-base leading-relaxed text-slate-400/90 group-hover:text-slate-300 transition-colors">{dish.desc}</p>
                                    </div>
                                </ScrollReveal>
                            ))}

                            {extras.map((item, i) => (
                                <ScrollReveal key={item.title} delay={0.4 + (i * 0.1)}>
                                    <div className="group border-l-2 border-primary/30 pl-5 md:pl-6 hover:border-primary transition-colors duration-300">
                                        <span className="font-sans text-[10px] md:text-xs tracking-[0.25em] uppercase text-primary/80 mb-2 block">{item.course}</span>
                                        <h3 className="font-serif-title text-2xl md:text-3xl text-slate-100 mb-3 group-hover:text-white transition-colors leading-tight">{item.title}</h3>
                                        <p className="font-sans text-[15px] md:text-base leading-relaxed text-slate-400/90 group-hover:text-slate-300 transition-colors">{item.desc}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Philosophy Strip */}
            <ScrollReveal className="w-full">
                <div className="bg-charcoal py-16 border-y border-primary/10">
                    <div className="max-w-[960px] mx-auto px-6 text-center space-y-4">
                        <h4 className="text-primary text-sm font-bold tracking-[0.2em] uppercase">Nuestra Filosofía</h4>
                        <p className="font-serif-title text-2xl md:text-3xl text-slate-200 italic">
                            &quot;La buena comida no debería ser inaccesible ni algo distante.&quot;
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Infinite plates carousel */}
            <div className="py-20 bg-background-dark">
                <ScrollReveal>
                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-neutral-gold text-center mb-8 px-6">
                        — Platos de Temporada
                    </p>
                </ScrollReveal>
                <div className="relative">
                    {/* Shadow overlays for dark mode */}
                    <div className="absolute left-0 top-0 h-full w-20 md:w-32 z-10 bg-gradient-to-r from-background-dark to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 h-full w-20 md:w-32 z-10 bg-gradient-to-l from-background-dark to-transparent pointer-events-none" />
                    <InfiniteCarousel />
                </div>
            </div>
        </section>
    );
}
