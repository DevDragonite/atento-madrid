"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const pillars = [
    {
        number: "01",
        title: "La Atención",
        body: "Atento a cada ingrediente, a cada técnica, a cada maridaje. Porque la atención no es un detalle — es la base de todo.",
        image: "/afiche.png",
    },
    {
        number: "02",
        title: "La Intimidad",
        body: "Solo cinco personas por cena. Una sola tablée cada noche. Toda mi energía, concentrada en ti.",
        image: "/servir.png",
    },
    {
        number: "03",
        title: "El Hogar",
        body: "No eres un cliente. Eres un invitado. Y mi casa se convierte en el escenario de algo que no olvidarás.",
        image: "/antoniococinando.png",
    },
];

export default function ExperienceSection() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const spanishX = useTransform(scrollYProgress, [0.1, 0.5], ["-30%", "0%"]);
    const thaiX = useTransform(scrollYProgress, [0.1, 0.5], ["30%", "0%"]);
    const fusionOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
    const lineScaleY = useTransform(scrollYProgress, [0.05, 0.4], [0, 1]);

    return (
        <section
            id="experiencia"
            ref={ref}
            className="relative bg-cream overflow-hidden"
            style={{ paddingTop: "clamp(6rem, 14vw, 12rem)", paddingBottom: "clamp(6rem, 14vw, 12rem)" }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-16">

                {/* Section label */}
                <ScrollReveal delay={0}>
                    <p className="font-sans text-xs tracking-[0.18em] uppercase text-warm-gray mb-20">
                        — La Experiencia
                    </p>
                </ScrollReveal>

                {/* Convergence animation */}
                <div className="relative flex items-center justify-center mb-20 h-16 overflow-hidden">
                    <motion.span
                        className="font-serif italic text-terracotta/70 text-xl md:text-2xl absolute left-0 md:left-8"
                        style={{ x: spanishX }}
                    >
                        maíz · lubina · langostino
                    </motion.span>

                    <motion.div
                        className="w-px bg-sage h-full absolute left-1/2"
                        style={{ scaleY: lineScaleY, transformOrigin: "top" }}
                    />

                    <motion.span
                        className="font-serif italic text-sage/80 text-xl md:text-2xl absolute right-0 md:right-8"
                        style={{ x: thaiX }}
                    >
                        curry · coco · citronela
                    </motion.span>

                    <motion.p
                        className="font-serif text-5xl md:text-6xl text-charcoal font-light absolute"
                        style={{ opacity: fusionOpacity }}
                    >
                        ×
                    </motion.p>
                </div>

                {/* ── Chef portrait + bio — balanced 50/50 ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20 items-center">

                    {/* Left: portrait — constrained height so text isn't dwarfed */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 24 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full overflow-hidden"
                        style={{ aspectRatio: "3/4", maxHeight: "400px" }}
                    >
                        <Image
                            src="/Perfil.png"
                            alt="Antonio, chef — perfil"
                            fill
                            priority
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
                    </motion.div>

                    {/* Right: bio text — vertically centered, comfortable padding */}
                    <ScrollReveal delay={0.2} className="flex flex-col justify-center gap-8">
                        <p className="font-sans text-warm-gray leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
                            Soy Antonio, chef con más de cinco años de experiencia en diferentes cocinas del mundo. Decidí hacer algo diferente: traer la alta gastronomía a un espacio donde la hospitalidad se siente en cada plato.
                        </p>
                        <p className="font-sans text-warm-gray leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
                            No en un restaurante cualquiera. En mi casa. Donde cada cena es exclusiva, limitada a solo <span className="text-charcoal font-medium">cinco personas</span>, para que vivas algo especial sin la barrera de los precios inalcanzables.
                        </p>
                    </ScrollReveal>
                </div>

                {/* ── Big headline — full width, below the photo block ── */}
                <ScrollReveal delay={0.1}>
                    <h2
                        className="font-serif font-light text-charcoal leading-tight mb-10"
                        style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", letterSpacing: "-0.025em" }}
                    >
                        Una cena que no parece una cena.
                    </h2>
                </ScrollReveal>

                {/* ── Pull quote — centered, full width ── */}
                <ScrollReveal delay={0.15}>
                    <div className="flex flex-col items-center text-center mb-16">
                        <p
                            className="font-serif italic text-charcoal/55 max-w-3xl"
                            style={{ fontSize: "clamp(1.15rem, 2.5vw, 1.7rem)", lineHeight: 1.65 }}
                        >
                            &ldquo;Aquí no solo vienes a cenar. Aquí eres atendido.&rdquo;
                        </p>
                        <p className="font-sans text-xs tracking-[0.14em] uppercase text-warm-gray mt-4">— Antonio, Chef</p>
                    </div>
                </ScrollReveal>

                {/* ── Pillars — taller cards, stronger overlay for legibility ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-linen pt-14">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={p.number}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative overflow-hidden flex flex-col"
                            style={{ minHeight: "380px" }}
                        >
                            {/* Background image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={p.image}
                                    alt={p.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                {/* Stronger overlay so text is clearly legible */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/55 to-charcoal/20" />
                            </div>

                            {/* Text — bottom-anchored with bigger, clearer typography */}
                            <div className="relative mt-auto p-7 flex flex-col gap-3">
                                <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-terracotta/90">{p.number}</span>
                                <h3 className="font-serif font-light text-white" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)" }}>{p.title}</h3>
                                <p className="font-sans leading-relaxed text-white/85" style={{ fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)" }}>{p.body}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
