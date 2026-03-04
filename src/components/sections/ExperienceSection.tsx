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
            className="relative bg-background-dark overflow-hidden"
            style={{ paddingTop: "clamp(6rem, 14vw, 12rem)", paddingBottom: "clamp(6rem, 14vw, 12rem)" }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-16">

                {/* Section label */}
                <ScrollReveal delay={0}>
                    <p className="font-sans text-xs tracking-[0.4em] uppercase text-primary mb-20 text-center">
                        — La Experiencia
                    </p>
                </ScrollReveal>

                {/* Convergence animation (Updated colors for dark mode) */}
                <div className="relative flex items-center justify-center mb-20 h-16 overflow-hidden">
                    <motion.span
                        className="font-serif italic text-neutral-gold text-xl md:text-2xl absolute left-0 md:left-8"
                        style={{ x: spanishX }}
                    >
                        maíz · lubina · langostino
                    </motion.span>

                    <motion.div
                        className="w-px bg-primary/30 h-full absolute left-1/2"
                        style={{ scaleY: lineScaleY, transformOrigin: "top" }}
                    />

                    <motion.span
                        className="font-serif italic text-neutral-gold text-xl md:text-2xl absolute right-0 md:right-8"
                        style={{ x: thaiX }}
                    >
                        curry · coco · citronela
                    </motion.span>

                    <motion.p
                        className="font-serif text-5xl md:text-6xl text-slate-100 font-light absolute"
                        style={{ opacity: fusionOpacity }}
                    >
                        ×
                    </motion.p>
                </div>

                {/* ── Chef portrait + bio — updated for dark theme ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20 items-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 24 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full overflow-hidden rounded-xl border border-white/5"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-80" />
                    </motion.div>

                    <ScrollReveal delay={0.2} className="flex flex-col justify-center gap-8 border-l border-primary/30 pl-8">
                        <p className="font-sans text-neutral-gold/90 font-light leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
                            Soy Antonio, chef con más de cinco años de experiencia en diferentes cocinas del mundo. Decidí hacer algo diferente: traer la alta gastronomía a un espacio donde la hospitalidad se siente en cada plato.
                        </p>
                        <p className="font-sans text-neutral-gold/90 font-light leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
                            No en un restaurante cualquiera. En mi casa. Donde cada cena es exclusiva, limitada a solo <span className="text-primary font-bold">cinco personas</span>, para que vivas algo especial sin la barrera de los precios inalcanzables.
                        </p>
                    </ScrollReveal>
                </div>

                {/* ── Big headline ── */}
                <ScrollReveal delay={0.1}>
                    <h2
                        className="font-serif-title text-slate-100 leading-tight mb-10 text-center"
                        style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", letterSpacing: "-0.025em" }}
                    >
                        Una cena que no parece una cena.
                    </h2>
                </ScrollReveal>

                {/* ── Pull quote ── */}
                <ScrollReveal delay={0.15}>
                    <div className="flex flex-col items-center text-center mb-16">
                        <p
                            className="font-serif italic text-neutral-gold max-w-3xl"
                            style={{ fontSize: "clamp(1.15rem, 2.5vw, 1.7rem)", lineHeight: 1.65 }}
                        >
                            &ldquo;Aquí no solo vienes a cenar. Aquí eres atendido.&rdquo;
                        </p>
                        <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-primary mt-4">— Antonio, Chef</p>
                    </div>
                </ScrollReveal>

                {/* ── Pillars — Updated to match 8-course grid style from Stitch ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-14">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={p.number}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-deep-charcoal border border-white/5"
                            style={{ minHeight: "380px" }}
                        >
                            <div className="absolute inset-0">
                                <Image
                                    src={p.image}
                                    alt={p.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-90" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <div className="backdrop-blur-md bg-white/5 p-5 rounded-lg border border-white/10 transition-colors group-hover:bg-white/10">
                                    <span className="text-primary text-[10px] font-bold tracking-widest uppercase mb-2 block">Pilar {p.number}</span>
                                    <h3 className="text-slate-100 font-serif-title mb-3" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)" }}>{p.title}</h3>
                                    <p className="text-neutral-gold/80 font-sans leading-snug group-hover:text-neutral-gold transition-colors duration-300" style={{ fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)" }}>{p.body}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
