"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";

type FormState = "idle" | "loading" | "success";

export default function ReservationsSection() {
    const [formState, setFormState] = useState<FormState>("idle");
    const [form, setForm] = useState({
        name: "",
        email: "",
        date: "",
        guests: "2",
        dietary: "",
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormState("loading");
        setTimeout(() => setFormState("success"), 1800);
    }

    return (
        <section
            id="reservas"
            className="bg-cream"
            style={{ paddingTop: "clamp(6rem, 12vw, 10rem)", paddingBottom: "clamp(6rem, 12vw, 10rem)" }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-16">

                {/* ── Layout: narrow image column + wide form column ── */}
                <div className="flex flex-col md:flex-row gap-16 md:gap-24 xl:gap-32 items-stretch">

                    {/* LEFT — smaller image panel with heading, slides in from right */}
                    <motion.div
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative overflow-hidden flex-shrink-0 w-full md:w-[38%]"
                        style={{ minHeight: "clamp(420px, 60vh, 680px)" }}
                    >
                        <Image
                            src="/copas.png"
                            alt="Copas en mesa de Atento"
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 38vw"
                            priority
                        />
                        {/* Gradient for heading legibility at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />

                        {/* Heading at the bottom of the image */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                            <p className="font-sans text-[11px] tracking-[0.22em] uppercase text-cream/60 mb-5">
                                — Reservas
                            </p>
                            <h2
                                className="font-serif font-light text-cream leading-tight"
                                style={{ fontSize: "clamp(2.2rem, 4vw, 3.8rem)", letterSpacing: "-0.03em" }}
                            >
                                Una noche.<br />
                                <em>Tu mesa.</em>
                            </h2>
                        </div>
                    </motion.div>

                    {/* RIGHT — full-width form area with generous space */}
                    <div className="flex-1 flex flex-col justify-center">

                        <ScrollReveal delay={0.1}>
                            <p className="font-sans text-sm leading-relaxed text-warm-gray mb-10 max-w-md">
                                Las cenas son limitadas a solo cinco comensales. Una sola mesa por noche. Escríbeme tus fechas preferidas y te confirmo disponibilidad en menos de 24 horas.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={0.18}>
                            <div className="flex flex-col gap-4 mb-12">
                                {[
                                    "Menú degustación de temporada — precio cerrado",
                                    "Maridaje de vinos naturales disponible",
                                    "Adaptación total a intolerancias y alergias",
                                    "Ubicación compartida al confirmar reserva",
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta inline-block mt-1.5 shrink-0" />
                                        <p className="font-sans text-sm text-warm-gray leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* Form */}
                        <ScrollReveal delay={0.25} className="relative">
                            <AnimatePresence mode="wait">
                                {formState === "success" ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex flex-col gap-8 py-10"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                            className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A9E85" strokeWidth="1.5">
                                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </motion.div>
                                        <h3 className="font-serif text-3xl font-light text-charcoal">Solicitud recibida</h3>
                                        <p className="font-sans text-sm leading-relaxed text-warm-gray">
                                            Gracias, <span className="text-charcoal">{form.name || "querido invitado"}</span>.<br />
                                            Te escribiré en las próximas 24 horas con la confirmación.
                                        </p>
                                        <button
                                            className="font-sans text-xs tracking-[0.14em] uppercase text-terracotta hover:text-charcoal transition-colors w-fit"
                                            onClick={() => setFormState("idle")}
                                        >
                                            ← Hacer otra reserva
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col gap-8 max-w-lg"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <label className="font-sans text-[11px] tracking-[0.16em] uppercase text-warm-gray">Nombre</label>
                                            <input type="text" name="name" required value={form.name} onChange={handleChange}
                                                placeholder="Tu nombre"
                                                className="bg-transparent border-b border-linen focus:border-charcoal transition-colors duration-300 pb-3 font-sans text-sm text-charcoal placeholder:text-warm-gray/40 outline-none" />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="font-sans text-[11px] tracking-[0.16em] uppercase text-warm-gray">Correo electrónico</label>
                                            <input type="email" name="email" required value={form.email} onChange={handleChange}
                                                placeholder="hola@ejemplo.com"
                                                className="bg-transparent border-b border-linen focus:border-charcoal transition-colors duration-300 pb-3 font-sans text-sm text-charcoal placeholder:text-warm-gray/40 outline-none" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-3">
                                                <label className="font-sans text-[11px] tracking-[0.16em] uppercase text-warm-gray">Fecha preferida</label>
                                                <input type="date" name="date" required value={form.date} onChange={handleChange}
                                                    className="bg-transparent border-b border-linen focus:border-charcoal transition-colors duration-300 pb-3 font-sans text-sm text-charcoal outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="font-sans text-[11px] tracking-[0.16em] uppercase text-warm-gray">Comensales</label>
                                                <select name="guests" value={form.guests} onChange={handleChange}
                                                    className="bg-transparent border-b border-linen focus:border-charcoal transition-colors duration-300 pb-3 font-sans text-sm text-charcoal appearance-none cursor-pointer outline-none">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="font-sans text-[11px] tracking-[0.16em] uppercase text-warm-gray">Intolerancias o alergias</label>
                                            <textarea name="dietary" value={form.dietary} onChange={handleChange}
                                                placeholder="Cuéntame cualquier restricción alimentaria o preferencia…"
                                                rows={3}
                                                className="bg-transparent border-b border-linen focus:border-charcoal transition-colors duration-300 pb-3 font-sans text-sm text-charcoal placeholder:text-warm-gray/40 resize-none outline-none" />
                                        </div>

                                        <div className="pt-2">
                                            <MagneticButton onClick={handleSubmit as () => void} variant="primary">
                                                {formState === "loading" ? (
                                                    <span className="flex items-center gap-3">
                                                        <motion.span
                                                            className="w-4 h-4 border border-cream/50 border-t-cream rounded-full inline-block"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        Enviando…
                                                    </span>
                                                ) : (
                                                    "Solicitar Reserva →"
                                                )}
                                            </MagneticButton>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
