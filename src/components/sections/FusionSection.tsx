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
        <section id="fusion" className="bg-linen" style={{ paddingTop: "clamp(6rem, 14vw, 12rem)", paddingBottom: "clamp(6rem, 14vw, 12rem)" }}>
            <div className="max-w-7xl mx-auto px-6 md:px-16">

                {/* Header — heading full width, description below with room to breathe */}
                <div className="mb-20">
                    <ScrollReveal>
                        <p className="font-sans text-xs tracking-[0.18em] uppercase text-warm-gray mb-8">— El Menú</p>
                        <h2
                            className="font-serif font-light text-charcoal leading-tight mb-10"
                            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.025em" }}
                        >
                            Una sola propuesta.<br />
                            <em>Cinco momentos.</em>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.15}>
                        <p className="font-sans text-base leading-relaxed text-warm-gray max-w-2xl">
                            Sin carta. Sin elección. Solo la mejor versión de lo que cada temporada
                            te puede dar — interpretada con técnica española y alma asiática.
                        </p>
                    </ScrollReveal>
                </div>

                {/* 3-column image grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
                    {menuItems.map((dish, i) => (
                        <TiltCard
                            key={dish.title}
                            src={dish.src}
                            alt={dish.alt}
                            course={dish.course}
                            title={dish.title}
                            desc={dish.desc}
                            delay={i * 0.1}
                        />
                    ))}
                </div>

                {/* Sorbete + Postre — text-only cards — fixed spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t border-charcoal/10 pt-12 mb-20">
                    {extras.map((item, i) => (
                        <ScrollReveal key={item.title} delay={i * 0.1}>
                            <div className="bg-cream/60 px-8 py-10 flex flex-col gap-3">
                                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-terracotta">{item.course}</span>
                                <h3 className="font-serif text-2xl md:text-3xl font-light text-charcoal">{item.title}</h3>
                                <p className="font-sans text-sm leading-relaxed text-warm-gray">{item.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Philosophy quote — separated from extras with generous space */}
                <ScrollReveal delay={0.2}>
                    <div className="border-t border-charcoal/10 pt-16 text-center">
                        <blockquote
                            className="font-serif italic text-charcoal/40 max-w-2xl mx-auto"
                            style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)", lineHeight: 1.6 }}
                        >
                            &ldquo;La buena comida no debería ser inaccesible ni algo distante.&rdquo;
                        </blockquote>
                        <p className="font-sans text-xs tracking-[0.14em] uppercase text-warm-gray mt-5">— Antonio</p>
                    </div>
                </ScrollReveal>
            </div>

            {/* ── Infinite plates carousel — full width ── */}
            <div className="mt-20">
                <ScrollReveal>
                    <p className="font-sans text-xs tracking-[0.18em] uppercase text-warm-gray text-center mb-4 px-6">
                        — Nuestros platos
                    </p>
                </ScrollReveal>
                <InfiniteCarousel />
            </div>
        </section>
    );
}
